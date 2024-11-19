// main.tf

# Define provider and required versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-2"

  default_tags {
    tags = local.tags
  }

  # Add retry mechanism
  retry_mode  = "standard"
  max_retries = 3
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  region                = "eu-west-2"
  project_name          = "interviewoptimiser"
  account_id            = data.aws_caller_identity.current.account_id
  current_region        = data.aws_region.current.name
  s3_bucket_name        = "${local.project_name}-artifacts"
  lambda_execution_role = "${local.project_name}-lambda_execution_role"
  lambda_runtime        = "nodejs20.x"
  artifacts_dir         = "${path.module}/artifacts"

  lambda_common = {
    s3_bucket_path      = "${local.s3_bucket_name}/${local.project_name}"
    artifacts_path      = "${local.artifacts_dir}"
    zip_file_extension  = ".zip"
    lambda_secrets_name = "${local.project_name}-secrets"
  }

  lambdas = {
    generate_report = {
      name = "generate-report"
    }
    vet_review = {
      name = "vet-review"
    }
    restore_database = {
      name = "restore-database"
    }
    regenerate_incomplete_reports = {
      name = "regenerate-incomplete-reports"
    }
  }

  lambda_details = { for k, v in local.lambdas :
    k => {
      name                = v.name
      s3_filepath         = "${local.lambda_common.s3_bucket_path}-${v.name}"
      lambda_path         = "${local.lambda_common.artifacts_path}/${v.name}/"
      lambda_zip_filename = "${v.name}${local.lambda_common.zip_file_extension}"
      function_name       = "${local.project_name}-${v.name}"
    }
  }

  base_tags = {
    "interviewoptmiser/service"    = local.project_name
    "interviewoptmiser/region"     = try(local.region, null)
    "interviewoptmiser/managed-by" = "terraform"
  }

  # Remove null or empty values from tags
  tags = { for k, v in local.base_tags : k => v if v != null && v != "" }
}

output "tags" {
  value = local.tags
}

locals {
  sqs_queue_base_url = "https://sqs.${local.region}.amazonaws.com/${data.aws_caller_identity.current.account_id}"

  lambda_environment_variables = {
    generate_report = {
      DATABASE_URL      = var.DATABASE_URL
      OPENAI_API_KEY    = var.OPENAI_API_KEY
      HELICONE_API_KEY  = var.HELICONE_API_KEY
      POSTHOG_KEY       = var.POSTHOG_KEY
      SQS_QUEUE_URL     = "${local.sqs_queue_base_url}/${local.project_name}-generate-report-queue"
      DLQ_URL           = "${local.sqs_queue_base_url}/${local.project_name}-generate-report-dlq"
      PINO_LOG_LEVEL    = "info"
      LAMBDA_AWS_REGION = local.region
      DISCORD_BOT_TOKEN = var.DISCORD_BOT_TOKEN
    }
    vet_review = {
      DATABASE_URL      = var.DATABASE_URL
      OPENAI_API_KEY    = var.OPENAI_API_KEY
      RESEND_API_KEY    = var.RESEND_API_KEY
      PINO_LOG_LEVEL    = "info"
      LAMBDA_AWS_REGION = local.region
      DISCORD_BOT_TOKEN = var.DISCORD_BOT_TOKEN
    }
    restore_database = {
      DATABASE_URL       = var.DATABASE_URL
      LAMBDA_BUCKET_NAME = local.s3_bucket_name
      RESEND_API_KEY     = var.RESEND_API_KEY
      PINO_LOG_LEVEL     = "info"
      LAMBDA_AWS_REGION  = local.region
      DISCORD_BOT_TOKEN  = var.DISCORD_BOT_TOKEN
    }

    regenerate_incomplete_reports = {
      DATABASE_URL       = var.DATABASE_URL
      OPENAI_API_KEY     = var.OPENAI_API_KEY
      REPORT_LAMBDA_NAME = local.lambda_details["generate_report"].function_name
      SQS_QUEUE_URL      = aws_sqs_queue.generate_report_queue.url
      PINO_LOG_LEVEL     = "info"
      LAMBDA_AWS_REGION  = data.aws_region.current.name
      DISCORD_BOT_TOKEN  = var.DISCORD_BOT_TOKEN
    }
  }
}