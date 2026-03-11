"use client"

import type { FormikProps } from "formik"
import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Country options
const countries = [
  { value: "US", label: "Amerika Birleşik Devletleri" },
  { value: "CA", label: "Kanada" },
  { value: "GB", label: "Birleşik Krallık" },
  { value: "FR", label: "Fransa" },
  { value: "DE", label: "Almanya" },
  { value: "JP", label: "Japonya" },
  { value: "CN", label: "Çin" },
  { value: "AU", label: "Avustralya" },
  { value: "BR", label: "Brezilya" },
  { value: "IN", label: "Hindistan" },
]

// Language options
const languages = [
  { value: "tr-TR", label: "Türkçe" },
]

// Timezone options
const timezones = [
  { value: "America/New_York", label: "Doğu Saati (ET)" },
  { value: "America/Chicago", label: "Merkez Saati (CT)" },
  { value: "America/Denver", label: "Dağ Saati (MT)" },
  { value: "America/Los_Angeles", label: "Pasifik Saati (PT)" },
  { value: "Europe/London", label: "Greenwich Ortalama Saati (GMT)" },
  { value: "Europe/Paris", label: "Orta Avrupa Saati (CET)" },
  { value: "Asia/Tokyo", label: "Japonya Standart Saati (JST)" },
  { value: "Asia/Shanghai", label: "Çin Standart Saati (CST)" },
  { value: "Australia/Sydney", label: "Avustralya Doğu Saati (AET)" },
  { value: "Pacific/Auckland", label: "Yeni Zelanda Standart Saati (NZST)" },
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
          <FormattedMessage id="location.title" defaultMessage="Konum ve Dil" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            <FormattedMessage id="location.country" defaultMessage="Ülke" />
          </Label>
          <Select
            name="country"
            value={formik.values.country}
            onValueChange={(value) => formik.setFieldValue("country", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage
                    id="location.country.placeholder"
                    defaultMessage="Ülkeni seç"
                  />
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
            <FormattedMessage id="location.language" defaultMessage="Dil" />
          </Label>
          <Select
            name="language"
            value={formik.values.language}
            onValueChange={(value) => formik.setFieldValue("language", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage
                    id="location.language.placeholder"
                    defaultMessage="Dilini seç"
                  />
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
            <FormattedMessage id="location.timezone" defaultMessage="Saat Dilimi" />
          </Label>
          <Select
            name="timezone"
            value={formik.values.timezone}
            onValueChange={(value) => formik.setFieldValue("timezone", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  <FormattedMessage
                    id="location.timezone.placeholder"
                    defaultMessage="Saat dilimini seç"
                  />
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
