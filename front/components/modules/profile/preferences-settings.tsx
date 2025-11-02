import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

/**
 * PreferencesSettings Component
 *
 * Settings form for user general preferences.
 *
 * @param {Object} props - Component props
 * @param {Object} props.settings - Current preference settings
 * @param {Function} props.toggleSetting - Function to toggle a setting value
 */
export function PreferencesSettings({
  settings,
  toggleSetting,
}: {
  settings: {
    darkMode: boolean
    soundEffects: boolean
    voiceOver: boolean
  }
  toggleSetting: (setting: keyof typeof settings) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="preferences.title" defaultMessage="Preferences" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="preferences.darkMode" defaultMessage="Dark Mode" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage id="preferences.darkMode.description" defaultMessage="Use dark theme" />
            </p>
          </div>
          <Switch checked={settings.darkMode} onCheckedChange={() => toggleSetting("darkMode")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="preferences.soundEffects" defaultMessage="Sound Effects" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage id="preferences.soundEffects.description" defaultMessage="Enable sound effects" />
            </p>
          </div>
          <Switch checked={settings.soundEffects} onCheckedChange={() => toggleSetting("soundEffects")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="preferences.voiceOver" defaultMessage="Voice Over" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="preferences.voiceOver.description"
                defaultMessage="Enable audio reading of phrases"
              />
            </p>
          </div>
          <Switch checked={settings.voiceOver} onCheckedChange={() => toggleSetting("voiceOver")} />
        </div>
      </CardContent>
    </Card>
  )
}
