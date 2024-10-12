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
  project_name          = "cvoptmiser"
  account_id            = data.aws_caller_identity.current.account_id
  current_region        = data.aws_region.current.name
  s3_bucket_name        = "${local.project_name}-lambdas"
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
    generate_cover_letter = {
      name       = "generate-cover-letter"
      sentry_dsn = "https://432e24ad8d4c63144ab026e372ea0cdb@o1198116.ingest.us.sentry.io/4507218555961344"
    }
    optimise_cv = {
      name       = "optimise-cv"
      sentry_dsn = "https://432e24ad8d4c63144ab026e372ea0cdb@o1198116.ingest.us.sentry.io/4507218555961344"
    }
    restart_incomplete_optimizations = {
      name       = "restart-incomplete-optimizations"
      sentry_dsn = "https://432e24ad8d4c63144ab026e372ea0cdb@o1198116.ingest.us.sentry.io/4507218555961344"
    }
    generate_pdf = {
      name       = "generate-pdf"
      sentry_dsn = "https://432e24ad8d4c63144ab026e372ea0cdb@o1198116.ingest.us.sentry.io/4507218555961344"
    }
    add_to_queue = {
      name       = "add-to-queue"
      sentry_dsn = "https://432e24ad8d4c63144ab026e372ea0cdb@o1198116.ingest.us.sentry.io/4507218555961344"
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
    "cvoptmiser/service"    = local.project_name
    "cvoptmiser/region"     = try(local.region, null)
    "cvoptmiser/managed-by" = "terraform"
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
    generate_cover_letter = {
      DATABASE_URL      = var.DATABASE_URL
      OPENAI_API_KEY    = var.OPENAI_API_KEY
      SQS_QUEUE_URL     = "${local.sqs_queue_base_url}/${local.project_name}-generate-cover-letter-queue"
      DLQ_URL           = "${local.sqs_queue_base_url}/${local.project_name}-generate-cover-letter-dlq"
      PINO_LOG_LEVEL    = "info"
      LAMBDA_AWS_REGION = local.region
    }
    optimise_cv = {
      DATABASE_URL      = var.DATABASE_URL
      OPENAI_API_KEY    = var.OPENAI_API_KEY
      SQS_QUEUE_URL     = "${local.sqs_queue_base_url}/${local.project_name}-optimize-cv-queue"
      DLQ_URL           = "${local.sqs_queue_base_url}/${local.project_name}-optimize-cv-dlq"
      PINO_LOG_LEVEL    = "info"
      LAMBDA_AWS_REGION = local.region
    }
    restart_incomplete_optimizations = {
      DATABASE_URL            = var.DATABASE_URL
      OPENAI_API_KEY          = var.OPENAI_API_KEY
      OPTIMISE_CV_LAMBDA_NAME = local.lambda_details["optimise_cv"].function_name
      SQS_QUEUE_URL           = aws_sqs_queue.optimise_cv_queue.url
      PINO_LOG_LEVEL          = "info"
      LAMBDA_AWS_REGION       = local.region
    }
    generate_pdf = {
      LAMBDA_BUCKET_NAME = local.s3_bucket_name
      PINO_LOG_LEVEL     = "info"
      LAMBDA_AWS_REGION  = local.region
    }
    add_to_queue = {
      OPTIMISE_CV_QUEUE_URL           = aws_sqs_queue.optimise_cv_queue.url
      GENERATE_COVER_LETTER_QUEUE_URL = aws_sqs_queue.generate_cover_letter_queue.url
      PINO_LOG_LEVEL                  = "info"
      LAMBDA_AWS_REGION               = local.region
    }
  }
}