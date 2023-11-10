import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../provider/AuthProvider";
import { supabase } from "../../config/initSupabase";
import { FileObject } from "@supabase/storage-js";
import ImageItem from "../../components/ImageItem";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

const list = () => {
  const { user, session } = useAuth();
  const [files, setFiles] = useState<FileObject[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load user images
    loadImages();
  }, [user]);

  const loadImages = async () => {
    const { data } = await supabase.storage.from("files").list(user!.id);
    if (data) {
      setFiles(data);
    }
  };

  const onSelectImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    // Save image if not canceled
    if (!result.canceled) {
      const img = result.assets[0];
      const uri = img.uri;
      const fileName = img?.fileName ?? "";

      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], fileName);

      const filePath = `${user!.id}/${new Date().getTime()}.${
        img.type === "image" ? "png" : "mp4"
      }`;

      const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      const SUPABASE_PROJECT_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const STORAGE_BUCKET = "files";
      const BEARER_TOKEN = session?.access_token;
      const supabaseStorageURL = `${SUPABASE_PROJECT_URL}/storage/v1/upload/resumable`;

      const uppy = new Uppy().use(Tus, {
        endpoint: supabaseStorageURL,
        headers: {
          authorization: `Bearer ${BEARER_TOKEN}`,
          apikey: SUPABASE_ANON_KEY,
        },
        chunkSize: 6 * 1024 * 1024,
        allowedMetaFields: [
          "bucketName",
          "objectName",
          "contentType",
          "cacheControl",
        ],
      });

      const filteredFileName = fileName.replace(/[^a-z\d\.]/g, "-");

      uppy.addFile({
        name: filteredFileName,
        type: file.type,
        data: file,
        meta: {
          bucketName: STORAGE_BUCKET,
          objectName: filePath,
          contentType: file.type,
        },
      });

      await uppy.upload();

      loadImages();
    }
  };

  const onRemoveImage = async (item: FileObject, listIndex: number) => {
    supabase.storage.from("files").remove([`${user!.id}/${item.name}`]);
    const newFiles = [...files];
    newFiles.splice(listIndex, 1);
    setFiles(newFiles);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {files.map((item, index) => (
          <ImageItem
            key={item.id}
            item={item}
            userId={user!.id}
            onRemoveImage={() => onRemoveImage(item, index)}
          />
        ))}
      </ScrollView>

      {/* FAB to add images */}
      <TouchableOpacity onPress={onSelectImage} style={styles.fab}>
        <Ionicons name="camera-outline" size={30} color={"#fff"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#151515",
  },
  fab: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    position: "absolute",
    bottom: 40,
    right: 30,
    height: 70,
    backgroundColor: "#2b825b",
    borderRadius: 100,
  },
});

export default list;
