import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

/**
 * AccessibilitySettings Component
 *
 * Settings form for user accessibility preferences.
 *
 * @param {Object} props - Component props
 * @param {Object} props.settings - Current accessibility settings
 * @param {Function} props.toggleSetting - Function to toggle a setting value
 */
export function AccessibilitySettings({
  settings,
  toggleSetting,
}: {
  settings: {
    highContrast: boolean
    largeText: boolean
    reducem: boolean
    screenReader: boolean
  }
  toggleSetting: (setting: keyof typeof settings) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="accessibility.title" defaultMessage="Accessibility" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="accessibility.highContrast" defaultMessage="High Contrast" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="accessibility.highContrast.description"
                defaultMessage="Increases contrast for better readability"
              />
            </p>
          </div>
          <Switch checked={settings.highContrast} onCheckedChange={() => toggleSetting("highContrast")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="accessibility.largeText" defaultMessage="Larger Text" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="accessibility.largeText.description"
                defaultMessage="Increases text size throughout the app"
              />
            </p>
          </div>
          <Switch checked={settings.largeText} onCheckedChange={() => toggleSetting("largeText")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="accessibility.reducem" defaultMessage="Reduce Animations" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="accessibility.reducem.description"
                defaultMessage="Reduces or disables animations"
              />
            </p>
          </div>
          <Switch checked={settings.reducem} onCheckedChange={() => toggleSetting("reducem")} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-medium">
              <FormattedMessage id="accessibility.screenReader" defaultMessage="Screen Reader Compatibility" />
            </h6>
            <p className="text-sm text-gray-500">
              <FormattedMessage
                id="accessibility.screenReader.description"
                defaultMessage="Optimizes the app for screen readers"
              />
            </p>
          </div>
          <Switch checked={settings.screenReader} onCheckedChange={() => toggleSetting("screenReader")} />
        </div>
      </CardContent>
    </Card>
  )
}
