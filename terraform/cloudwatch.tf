# CloudWatch Event Rule for vet-review Lambda
resource "aws_cloudwatch_event_rule" "daily_review_vetting" {
  name                = "daily-review-vetting"
  description         = "Trigger review vetting Lambda function daily"
  schedule_expression = "cron(0 1 * * ? *)" # Run at 1am UTC daily
}

resource "aws_cloudwatch_event_target" "vet_review_target" {
  rule      = aws_cloudwatch_event_rule.daily_review_vetting.name
  target_id = "VetReviewLambda"
  arn       = aws_lambda_function.lambdas["vet_review"].arn
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch_to_call_vet_review" {
  statement_id  = "AllowCloudWatchToInvokeVetReview"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["vet_review"].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_review_vetting.arn
}
