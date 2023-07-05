import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../provider/AuthProvider';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { TusFileReader } from '../../helper/tusFileReader';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const SUPABASE_STORAGE_URL = 'https://kolrncrjvromhaivenfp.supabase.co/storage/v1/';

const list = () => {
  const { session } = useAuth();
  const [uppy, setUppy] = useState<Uppy>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!session) return;

    const uppyInstance = new Uppy({ debug: true, autoProceed: false })
      .use(Tus, {
        endpoint: `${SUPABASE_STORAGE_URL}object/files/${session.user.id}`,
        // fileReader: new TusFileReader(), <- this is not working
        // retryDelays: [0, 3000, 5000, 10000, 20000],
        // uploadDataDuringCreation: true,
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        chunkSize: 6 * 1024 * 1024,
        allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
      })

      .on('file-added', (file) => {
        file.meta = {
          ...file.meta,
          bucketName: `files`,
          objectName: `${session.user.id}/${file.name}`,
          contentType: file.type,
        };
        console.log('file-added:', file);
      })
      .on('upload-progress', (file, progress) => {
        console.log('upload-progress:', progress);

        setProgress(progress.bytesUploaded / progress.bytesTotal);
      })
      .on('complete', (result) => {
        console.log('complete:', result);
        setFiles([]);
        setUploading(false);
      })
      .on('progress', (progress) => {
        console.log('progress:', progress);
      })
      .on('error', (error) => {
        console.log('error:', JSON.stringify(error));
      });

    setUppy(uppyInstance);
  }, [session]);

  const onSelectImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    // Save image if not cancelled
    if (!result.canceled) {
      // UPPY APPROACH
      const img = result.assets[0];
      const fetchResponse = await fetch(img.uri);
      const blob = await fetchResponse.blob();
      console.log('🚀 ~ file: list.tsx:83 ~ onSelectImage ~ blob:', blob);
      const contentType = img.type === 'image' ? 'image/png' : 'video/mp4';
      const fileName = `${new Date().getTime()}.${img.type === 'image' ? 'png' : 'mp4'}`;
      console.log('🚀 ~ file: list.tsx:87 ~ onSelectImage ~ fileName:', fileName);

      // Add file to uppy with blob data
      uppy.addFile({
        id: fileName,
        name: fileName,
        type: blob.type,
        data: blob,
        size: blob.size,
      });

      // Add image to local files array
      setFiles((old) => [...old, { uri: img.uri, fileName, contentType }]);

      // SUPABASE STANDARD APPROACH
      // THIS WORKS
      // const img = result.assets[0];
      // const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      // const filePath = `${user.id}/${new Date().getTime()}.${img.type === 'image' ? 'png' : 'mp4'}`;
      // const contentType = img.type === 'image' ? 'image/png' : 'video/mp4';
      // let { error, data } = await supabase.storage.from('files').upload(filePath, decode(base64), { contentType });
      // console.log('error', error);
      // console.log('data', data);
    }
  };

  const onUpload = async () => {
    uppy.upload();
    setUploading(true);
  };

  const onPause = async () => {
    uppy.pauseAll();
    setUploading(false);
  };

  const onResume = async () => {
    uppy.resumeAll();
    setUploading(true);
  };

  // Render image list item
  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
        <Image style={{ width: 80, height: 80 }} source={{ uri: item.uri }} />
        <Text style={{ flex: 1, color: '#fff' }}>{item.fileName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      {uploading && <View style={{ width: `${progress}%`, height: 4, backgroundColor: '#fff', marginBottom: 10, borderRadius: 2 }} />}

      {/* Row with 3 buttons to start, pause and resume uploads */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <TouchableOpacity onPress={onUpload} style={styles.button}>
          <Text style={{ color: '#fff' }}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPause} style={styles.button}>
          <Text style={{ color: '#fff' }}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onResume} style={styles.button}>
          <Text style={{ color: '#fff' }}>Resume</Text>
        </TouchableOpacity>
      </View>

      {/* List of images to upload */}
      <FlatList data={files} renderItem={renderItem} style={{ marginTop: 50 }} />

      {/* FAB to add images */}
      <TouchableOpacity onPress={onSelectImage} style={styles.fab}>
        <Ionicons name="camera-outline" size={30} color={'#fff'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#151515',
  },
  fab: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    position: 'absolute',
    bottom: 40,
    right: 30,
    height: 70,
    backgroundColor: '#2b825b',
    borderRadius: 100,
  },
  button: {
    borderWidth: 2,
    borderColor: '#2b825b',
    padding: 12,
    borderRadius: 4,
  },
});

export default list;
