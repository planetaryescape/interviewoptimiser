variable "queue_name" {
  type        = string
  description = "Name of the SQS queue to be created"
}

variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "lambda_execution_role_name" {
  type        = string
  description = "Name of the Lambda execution role"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function to be triggered by the SQS queue"
}
