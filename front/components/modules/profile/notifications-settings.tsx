import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

/**
 * NotificationsSettings Component
 *
 * Settings form for user notification preferences.
 *
 * @param {Object} props - Component props
 * @param {Object} props.settings - Current notification settings
 * @param {Function} props.toggleSetting - Function to toggle a setting value
 */
export function NotificationsSettings({
  settings,
  toggleSetting,
}: {
  settings: {
    dailyReminder: boolean
    weeklyProgress: boolean
    newFeatures: boolean
    friendActivity: boolean
  }
  toggleSetting: (setting: keyof typeof settings) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="notifications.title" defaultMessage="Notifications" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="notifications.dailyReminder" defaultMessage="Daily Reminder" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="notifications.dailyReminder.description"
                defaultMessage="Receive a reminder to practice each day"
              />
            </p>
          </div>
          <Switch checked={settings.dailyReminder} onCheckedChange={() => toggleSetting("dailyReminder")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="notifications.weeklyProgress" defaultMessage="Weekly Progress" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="notifications.weeklyProgress.description"
                defaultMessage="Receive a summary of your progress each week"
              />
            </p>
          </div>
          <Switch checked={settings.weeklyProgress} onCheckedChange={() => toggleSetting("weeklyProgress")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="notifications.newFeatures" defaultMessage="New Features" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="notifications.newFeatures.description"
                defaultMessage="Be informed about new features"
              />
            </p>
          </div>
          <Switch checked={settings.newFeatures} onCheckedChange={() => toggleSetting("newFeatures")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="notifications.friendActivity" defaultMessage="Friend Activity" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="notifications.friendActivity.description"
                defaultMessage="Receive notifications about your friends' activity"
              />
            </p>
          </div>
          <Switch checked={settings.friendActivity} onCheckedChange={() => toggleSetting("friendActivity")} />
        </div>
      </CardContent>
    </Card>
  )
}
