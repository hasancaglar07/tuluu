"use client"

import type { FormikProps } from "formik"
import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Country options
const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "AU", label: "Australia" },
  { value: "BR", label: "Brazil" },
  { value: "IN", label: "India" },
]

// Language options
const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "es-ES", label: "Spanish" },
  { value: "it-IT", label: "Italian" },
  { value: "ja-JP", label: "Japanese" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ru-RU", label: "Russian" },
]

// Timezone options
const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (NZST)" },
]

/**
 * LocationLanguageForm Component
 *
 * Form for editing user location, language, and timezone preferences.
 *
 * @param {Object} props - Component props
 * @param {FormikProps<any>} props.formik - Formik instance for form handling
 */
export function LocationLanguageForm({ formik }: { formik: FormikProps<any> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="location.title" defaultMessage="Location & Language" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            <FormattedMessage id="location.country" defaultMessage="Country" />
          </Label>
          <Select
            name="country"
            value={formik.values.country}
            onValueChange={(value) => formik.setFieldValue("country", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage id="location.country.placeholder" defaultMessage="Select your country" />
                }
              />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.country && formik.errors.country && (
            <p className="text-sm text-red-500">{formik.errors.country}</p>
          )}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">
            <FormattedMessage id="location.language" defaultMessage="Language" />
          </Label>
          <Select
            name="language"
            value={formik.values.language}
            onValueChange={(value) => formik.setFieldValue("language", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage id="location.language.placeholder" defaultMessage="Select your language" />
                }
              />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.language && formik.errors.language && (
            <p className="text-sm text-red-500">{formik.errors.language}</p>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">
            <FormattedMessage id="location.timezone" defaultMessage="Timezone" />
          </Label>
          <Select
            name="timezone"
            value={formik.values.timezone}
            onValueChange={(value) => formik.setFieldValue("timezone", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage id="location.timezone.placeholder" defaultMessage="Select your timezone" />
                }
              />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.timezone && formik.errors.timezone && (
            <p className="text-sm text-red-500">{formik.errors.timezone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
