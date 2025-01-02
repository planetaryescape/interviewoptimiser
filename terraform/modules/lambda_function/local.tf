locals {
  lambda_runtime      = "nodejs20.x"
  function_name       = "${var.project_name}-${var.function_name}"
  role_name           = "${var.function_name}-role"
  lambda_zip_filename = "${var.function_name}-${var.region}.zip"
  lambda_s3_filepath  = "${var.function_name}/${local.lambda_zip_filename}"
  s3_bucket_name      = "${var.function_name}-artifacts-${var.region}"

  artifacts_dir  = "${path.root}/artifacts"
  lambda_path    = "${local.artifacts_dir}/${var.function_name}"
}
