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
