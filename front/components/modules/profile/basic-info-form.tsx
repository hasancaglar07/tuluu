"use client"

import type { FormikProps } from "formik"
import Image from "next/image"
import { FormattedMessage } from "react-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * BasicInfoForm Component
 *
 * Form for editing basic user information like name, bio, and avatar.
 *
 * @param {Object} props - Component props
 * @param {FormikProps<any>} props.formik - Formik instance for form handling
 */
export function BasicInfoForm({ formik }: { formik: FormikProps<any> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="basicInfo.title" defaultMessage="Basic Information" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Image
              src={formik.values.avatar || "/placeholder.svg?height=80&width=80" || "/placeholder.svg"}
              width={80}
              height={80}
              alt="Profile"
              className="rounded-full"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="avatar">
              <FormattedMessage id="basicInfo.avatar" defaultMessage="Profile Image URL" />
            </Label>
            <Input
              id="avatar"
              name="avatar"
              value={formik.values.avatar}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="https://example.com/avatar.jpg"
            />
            {formik.touched.avatar && formik.errors.avatar && (
              <p className="text-sm text-red-500">{formik.errors.avatar}</p>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            <FormattedMessage id="basicInfo.name" defaultMessage="Full Name" />
          </Label>
          <Input
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Your full name"
          />
          {formik.touched.name && formik.errors.name && <p className="text-sm text-red-500">{formik.errors.name}</p>}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">
            <FormattedMessage id="basicInfo.bio" defaultMessage="Bio" />
          </Label>
          <Textarea
            id="bio"
            name="bio"
            value={formik.values.bio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Tell us about yourself"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            <FormattedMessage
              id="basicInfo.bio.counter"
              defaultMessage="{count}/500 characters"
              values={{ count: formik.values.bio.length }}
            />
          </p>
          {formik.touched.bio && formik.errors.bio && <p className="text-sm text-red-500">{formik.errors.bio}</p>}
        </div>

        {/* Username (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="userName">
            <FormattedMessage id="basicInfo.username" defaultMessage="Username (cannot be changed)" />
          </Label>
          <Input id="userName" name="userName" value={formik.values.userName} readOnly disabled />
        </div>
      </CardContent>
    </Card>
  )
}
