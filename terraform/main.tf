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

# Provider for us-east-1 region (required for ACM certificates used with CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

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
  region         = "eu-west-2"
  project_name   = "interviewoptimiser"
  account_id     = data.aws_caller_identity.current.account_id
  current_region = data.aws_region.current.name
  s3_bucket_name = "${local.project_name}-artifacts"

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
