// pages/notifications/settings.tsx
import { useEffect, useState } from "react";
import { getNotificationSettings, saveNotificationSettings } from "../../../service/notificationService";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    // Event-Based Notifications
    newUserRegistration: false,
    raffleUpdate: false,
    maintenanceUpdates: false,
    
    // Alert Frequency
    user: false,
    raffle: false,
    inventory: false,
    
    // Reminders (first group)
    remindersDoNotNotify: false,
    remindersImportantOnly: false,
    remindersAll: false,
    
    // Reminders (second group - appears to be duplicate in screenshot)
    reminders2DoNotNotify: false,
    reminders2ImportantOnly: false,
    reminders2All: false,
    
    // More Activity About You
    activityDoNotNotify: false,
    activityAll: false,
    
    // Notification Method
    notificationMethod: "both" as "email" | "inApp" | "both"
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getNotificationSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    };
    loadSettings();
  }, []);

  const handleCheckboxChange = (field: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleRadioChange = (group: string, value: string) => {
    // Reset all options in the group first
    const newSettings = { ...settings };
    
    if (group === "reminders1") {
      newSettings.remindersDoNotNotify = value === "doNotNotify";
      newSettings.remindersImportantOnly = value === "importantOnly";
      newSettings.remindersAll = value === "all";
    } 
    else if (group === "reminders2") {
      newSettings.reminders2DoNotNotify = value === "doNotNotify";
      newSettings.reminders2ImportantOnly = value === "importantOnly";
      newSettings.reminders2All = value === "all";
    }
    else if (group === "activity") {
      newSettings.activityDoNotNotify = value === "doNotNotify";
      newSettings.activityAll = value === "all";
    }
    else if (group === "notificationMethod") {
      newSettings.notificationMethod = value as "email" | "inApp" | "both";
    }
    
    setSettings(newSettings);
  };

  const handleSave = async () => {
    await saveNotificationSettings(settings);
    alert("Notification settings saved successfully!");
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[18px] font-semibold text-dark">Notifications</h1>
          <div className="flex items-center divide-x divide-[#E4E7EC] rounded-md overflow-hidden border border-[#E4E7EC]">
            <button
              onClick={() => handleRadioChange('notificationMethod', 'email')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${settings.notificationMethod === 'email' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Email
            </button>
            <button
              onClick={() => handleRadioChange('notificationMethod', 'inApp')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${settings.notificationMethod === 'inApp' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              In-app
            </button>
            <button
              onClick={() => handleRadioChange('notificationMethod', 'both')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${settings.notificationMethod === 'both' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Both
            </button>
          </div>
      </div>
      
      {/* Event-Based Notifications */}
      <div className="mb-6">
        <div className="grid gap-x-24 gap-y-12 grid-cols-12">
          <div className="col-span-3">
            <h2 className="text-base font-semibold text-gray">Event-Based Notifications</h2>
            <p className="text-base font-normal text-gray">Receive the latest news, updates and industry tutorials from us.</p>
          </div>

          <div className="col-span-9">
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                checked={settings.newUserRegistration}
                onChange={() => handleCheckboxChange('newUserRegistration')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div>
                <label className="text-base text-gray font-medium">New User Registration</label>
                <p className="text-gray font-normal text-sm">News about product and feature updates.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                checked={settings.raffleUpdate}
                onChange={() => handleCheckboxChange('raffleUpdate')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div>
                <label className="text-base text-gray font-medium">Raffle Update</label>
                <p className="text-gray font-normal text-sm">Tips on getting more out of Untitled.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                checked={settings.maintenanceUpdates}
                onChange={() => handleCheckboxChange('maintenanceUpdates')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div>
                <label className="text-base text-gray font-medium">Maintenance Updates</label>
                <p className="text-gray font-normal text-sm">Get involved in our beta testing program or participate in paid product user research.</p>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <h2 className="text-base font-semibold text-gray">Alert Frequency</h2>
            <p className="text-base font-normal text-gray">Receive the latest news, updates and industry tutorials from us.</p>
          </div>

          {/* Alert Frequency */}
          <div className="col-span-9">
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                checked={settings.user}
                onChange={() => handleCheckboxChange('user')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div className="ml-3">
                <label className="text-base text-gray font-medium">User</label>
                <p className="text-gray font-normal text-sm">News about product and feature updates.</p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                checked={settings.raffle}
                onChange={() => handleCheckboxChange('raffle')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div className="ml-3">
                <label className="text-base text-gray font-medium">Raffle</label>
                <p className="text-gray font-normal text-sm">Tips on getting more out of Untitled.</p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                checked={settings.inventory}
                onChange={() => handleCheckboxChange('inventory')}
                className="accent-primary h-5 w-4 mt-1"
              />
              <div className="ml-3">
                <label className="text-base text-gray font-medium">Inventory</label>
                <p className="text-gray font-normal text-sm">Get involved in our beta testing program or participate in paid product user research.</p>
              </div>
            </div>
          </div>
          {/* First Reminders Group */}
          <div className="col-span-3">
            <h2 className="text-base font-semibold text-gray">Reminders</h2>
            <p className="text-base font-normal text-gray">These are notifications to remind you of updates you might have missed.</p>
          </div>
          <div className="col-span-9">
              <div className="flex items-center mb-4 gap-2">
                <input
                  type="radio"
                  checked={settings.remindersDoNotNotify}
                  onChange={() => handleRadioChange('reminders1', 'doNotNotify')}
                  className="h-5 w-5 accent-primary"
                  name="reminders1"
                />
                <label className="text-base text-gray font-medium">Do not notify me</label>
              </div>
              <div className="flex items-center mb-4 gap-2">
                <input
                  type="radio"
                  checked={settings.remindersImportantOnly}
                  onChange={() => handleRadioChange('reminders1', 'importantOnly')}
                  className="h-5 w-5 accent-primary"
                  name="reminders1"
                />
                <label className="text-base text-gray font-medium">Important reminders only</label>
                <p className="text-gray font-normal text-sm">Only notify me if the reminder is tagged as important.</p>
              </div>
              <div className="flex items-center mb-4 gap-2">
                <input
                  type="radio"
                  checked={settings.remindersAll}
                  onChange={() => handleRadioChange('reminders1', 'all')}
                  className="h-5 w-5 accent-primary"
                  name="reminders1"
                />
                <label className="text-base text-gray font-medium">All reminders</label>
                <p className="text-gray font-normal text-sm">Notify me for all reminders.</p>
              </div>
          </div>
          <div className="col-span-3">
            <h2 className="text-base font-semibold text-gray">Reminders</h2>
            <p className="text-base font-normal text-gray">These are notifications to remind you of updates you might have missed.</p>
          </div>
          {/* Second Reminders Group (duplicate in screenshot) */}
            <div className="col-span-9">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="radio"
                  checked={settings.reminders2DoNotNotify}
                  onChange={() => handleRadioChange('reminders2', 'doNotNotify')}
                  className="h-5 w-5 accent-primary"
                  name="reminders2"
                />
                <label className="text-base text-gray font-medium">Do not notify me</label>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="radio"
                  checked={settings.reminders2ImportantOnly}
                  onChange={() => handleRadioChange('reminders2', 'importantOnly')}
                  className="h-5 w-5 accent-primary"
                  name="reminders2"
                />
                <label className="text-base text-gray font-medium">Important reminders only</label>
                <p className="text-gray font-normal text-sm">Only notify me if the reminder is tagged as important.</p>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="radio"
                  checked={settings.reminders2All}
                  onChange={() => handleRadioChange('reminders2', 'all')}
                  className="h-5 w-5 accent-primary"
                  name="reminders2"
                />
                <label className="text-base text-gray font-medium">All reminders</label>
                <p className="text-gray font-normal text-sm">Notify me for all reminders.</p>
              </div>
          </div>
          
          {/* More Activity About You */}
          <div className="col-span-3">
              <h2 className="text-base font-semibold text-gray">More Activity About You</h2>
              <p className="text-base font-normal text-gray">These are notifications for posts on your profile, likes and other reactions to your posts, and more.</p>
          </div>
            <div className="col-span-9">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="radio"
                  checked={settings.activityDoNotNotify}
                  onChange={() => handleRadioChange('activity', 'doNotNotify')}
                  className="h-5 w-5 accent-primary"
                  name="activity"
                />
                <label className="text-base font-medium text-gray">Do not notify me</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={settings.activityAll}
                  onChange={() => handleRadioChange('activity', 'all')}
                  className="h-5 w-5 accent-primary"
                  name="activity"
                />
                <label className="text-base font-medium text-gray">All reminders</label>
                <p className="text-sm text-gray font-normal">Notify me for all other activity.</p>
              </div>
            </div>
        </div>
      </div>
      {/* Save Button */}
      <button
        onClick={handleSave}
        className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded"
      >
        Save Settings
      </button>
    </div>
  );
};

export default NotificationSettings;