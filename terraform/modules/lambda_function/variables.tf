variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "function_name" {
  type        = string
  description = "Name of the Lambda function to be created"
}

variable "region" {
  type        = string
  description = "AWS region where resources will be created"
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables required by the Lambda function"
}
