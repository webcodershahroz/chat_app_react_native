/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import pusherJs from 'pusher-js';
import {useMyContext} from './src/context/context'; // Ensure this is correctly imported
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

// Guard flag to prevent infinite loop
let notificationHandled = false;

notifee.onBackgroundEvent(async event => {
  console.log('[Background Notification]', event);

  // Check if notification is already handled
  if (notificationHandled) {
    console.log('Notification already handled, skipping...');
    return;
  }

  // Set the flag to prevent re-triggering
  notificationHandled = true;

  // Get or create the notification channel
  let channelId = await notifee.getChannel('default-greetings');
  if (channelId === null) {
    channelId = await notifee.createChannel({
      id: 'default-greetings1',
      name: 'Greetings',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      visibility: AndroidVisibility.PUBLIC,
    });
  }

  // Display the notification
  await notifee.displayNotification({
    title: event.detail.notification.title,
    body: event.detail.notification.body,
    android: {
      channelId: 'default-greetings1',
      smallIcon: 'ic_launcher',
      importance: AndroidImportance.HIGH,
      
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
  });

  // Optional: Add logic for dismissed or opened notifications

  // Reset the flag after a short delay (optional)
  setTimeout(() => {
    notificationHandled = false;
  }, 2000); // Adjust the delay as necessary
});

// Register the headless task to handle background events

AppRegistry.registerHeadlessTask(
  'NotifeeBackgroundEvent',
  () => notifee.onBackgroundEvent,
);

// Register the main component
// Define the headless task for background execution
const backgroundTask = async data => {
  console.log('Background task started', data);
  const {
    pusherRef,
    channelRef,
    getCurrentUser,
    handleReciveMessage,
    notifyMessageRecived,
    displayMessageNotification,
    pendingMessagesRecived,
  } = useMyContext();

  const connectToPusher = () => {
    const pusherInstance =
      pusherRef.current ||
      new pusherJs('b80a07f65d34ffabe87d', {cluster: 'ap2'});
    pusherRef.current = pusherInstance;
  };

  const subscribeToChannel = async () => {
    const currentUserEmail = await getCurrentUser();
    if (currentUserEmail !== null) {
      console.log('channelBinded');
      const channelName = `channel-${currentUserEmail}`;
      if (channelRef.current) {
        channelRef.current.unbind('receiveMessage');
        channelRef.current.unbind('messageRecived');
        channelRef.current.unbind('recivePendingMessages');
      }
      channelRef.current = await pusherRef.current.subscribe(channelName);
      channelRef.current.bind('receiveMessage', async data => {
        await handleReciveMessage(data, data.sender);
        try {
          await fetch('https://greetings-backend.vercel.app/messageRecived', {
            method: 'POST',
            body: JSON.stringify({
              message: data.message,
              sender: data.sender,
              reciver: data.reciver,
            }),
            headers: {'Content-Type': 'application/json'},
          });
        } catch (error) {
          console.log(error.message);
        }
        await displayMessageNotification(data.message[0], data.sender);
      });
      channelRef.current.bind('messageRecived', async data => {
        console.log('messageRecived', data);
        await notifyMessageRecived(data);
      });

      channelRef.current.bind('recivePendingMessages', async data => {
        console.log('pendingMessageRecived', data);
        await pendingMessagesRecived(data);
      });
    }
  };

  const addActiveUsers = async () => {
    const currentUserEmail = await getCurrentUser();
    if (currentUserEmail !== null) {
      const channelName = `channel-${currentUserEmail}`;
      await fetch('https://greetings-backend.vercel.app/userActive', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUserEmail,
          channelId: channelName,
        }),
        headers: {'Content-Type': 'application/json'},
      })
        .then(res => res.json())
        .then(async data => {
          console.log('activeUsers', data);
        });
    }
  };

  connectToPusher();
  await subscribeToChannel();
  await addActiveUsers();

  return Promise.resolve();
};

// Register the headless task
AppRegistry.registerHeadlessTask('MessageService', () => backgroundTask);
AppRegistry.registerComponent(appName, () => App);
