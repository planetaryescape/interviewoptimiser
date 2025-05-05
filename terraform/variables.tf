// variables.tf

variable "versioning_enabled" {
  description = "Enable versioning for S3 bucket"
  type        = bool
  default     = true
}

variable "encryption_enabled" {
  description = "Enable server-side encryption for S3 bucket"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "DATABASE_URL" {
  description = "Database URL"
  type        = string
}

variable "OPENAI_API_KEY" {
  description = "OpenAI API Key"
  type        = string
}

variable "HELICONE_API_KEY" {
  description = "Helicone API Key"
  type        = string
}

variable "POSTHOG_KEY" {
  description = "Posthog API Key"
  type        = string
}

variable "RESEND_API_KEY" {
  description = "Resend API Key"
  type        = string
}

variable "DISCORD_BOT_TOKEN" {
  description = "Discord bot token"
  type        = string
}

variable "HUME_API_KEY" {
  description = "Hume AI API Key for voice and audio services"
  type        = string
}
