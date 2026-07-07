import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Native Offline Background Notification Engine for Pet Pebble
 * Configured by Tharun Vijay (Build 2026)
 */
export const syncHourlyReminders = async (habitsList, petName = "Pebble") => {
    try {
        // 1. Request native push permissions from iOS or Android
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') {
            console.log('Push notification permissions denied by user layout');
            return;
        }

        // 2. Clear out any old scheduled pending reminder queues to avoid duplication bugs
        await LocalNotifications.cancel({ notifications: [{ id: 99 }] });

        // 3. Scan list: If everything is completed, exit early (No nagging needed!)
        const pendingTasks = habitsList.filter(h => !h.isCompletedToday);
        if (pendingTasks.length === 0 || habitsList.length === 0) {
            console.log('All goals completed! Nagging alerts cleared out safely.');
            return;
        }

        // 4. Funny pool of urgent, sarcastic slacker notifications
        const sarcasticNaggingQuotes = [
            `🚨 Hey! You have open habits! Do your chores or I'm moving into a hospital bed!`,
            `💀 Procrastination Alert! Your habits are slackin' and my stone skin is crackin'!`,
            `🥱 yawn... ${petName} is falling asleep out of sheer boredom. Go complete a task!`,
            `👻 BOO! Finish your tracker list before midnight or I'll haunt your phone!`,
            `🪨 Mineral energy dropping! Fuel my core right now by checking off a box!`
        ];

        const randomQuote = sarcasticNaggingQuotes[Math.floor(Math.random() * sarcasticNaggingQuotes.length)];

        // 5. Schedule a repeating native hardware background clock loop (Triggers every 3600 seconds / 1 Hour)
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 99,
                    title: `⚠️ ${petName.toUpperCase()} IS NAGGING YOU!`,
                    body: randomQuote,
                    largeBody: `${randomQuote} Remaining open items: ${pendingTasks.length}. Keep your streak alive!`,
                    schedule: { 
                        allowWhileIdle: true, // Forces phone to wake up even during Deep Sleep battery saver modes
                        every: 'hour' // Automatically loops the schedule parameter every single hour
                    },
                    sound: true,
                    vibrate: true,
                    actionTypeId: 'OPEN_APP'
                }
            ]
        });

        console.log('Hourly slacker check successfully locked into device background hardware clock.');
    } catch (error) {
        console.error('Capacitor Local Notifications failed to parse:', error);
    }
};
