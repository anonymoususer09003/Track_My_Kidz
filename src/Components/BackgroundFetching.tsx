import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import BackgroundTimer from 'react-native-background-timer';
import BackgroundFetch from 'react-native-background-fetch';

const SilentAudioPlayer = () => {
  useEffect(() => {
    // Define the silent audio track
    const track = {
      id: "silence",
      url: "http://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    };

    // Initialize Track Player
    TrackPlayer.setupPlayer();

    // Start playing the silent audio when background fetch is triggered
    const handleBackgroundFetch = async (taskId: string) => {
      try {
        await TrackPlayer.add(track);
        await TrackPlayer.play();
        console.log("Background fetch task completed successfully");
        BackgroundFetch.finish(taskId);
      } catch (error) {
        console.error("Error playing silent audio:", error);
        BackgroundFetch.finish(taskId);
      }
    };

    // Configure background fetch
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Minimum interval in minutes (iOS)
        stopOnTerminate: false, // Keep running when app is closed (Android)
        startOnBoot: true, // Start background fetch on device boot (Android)
        enableHeadless: true, // Enable headless mode (Android)
      },
      handleBackgroundFetch,
      (error) => console.error("Background fetch configure error:", error)
    );

    // Clean up on component unmount
    return () => {
      BackgroundFetch.stop();
      BackgroundTimer.stopBackgroundTimer();
    };
  }, []);

  return null; // Since this component handles background functionality, it doesn't render anything
};

export default SilentAudioPlayer;
