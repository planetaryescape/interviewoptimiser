resource "aws_cloudwatch_dashboard" "cv_optimization_dashboard" {
  dashboard_name = "${local.project_name}-cv-optimization-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "log"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/aws/lambda/${local.project_name}-optimise-cv' | filter message like /MONITORING/ | filter metric='OptimizationTokenUsage' | stats avg(promptTokens) as prompt_tokens, avg(completionTokens) as completion_tokens, avg(totalTokens) as total_tokens by bin(5m)"
          region  = local.region
          title   = "Optimization Token Usage"
          view    = "timeSeries"
          stacked = false
        }
      },
      {
        type   = "log"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/aws/lambda/${local.project_name}-optimise-cv' | filter message like /MONITORING/ | filter metric='EvaluationTokenUsage' | stats avg(promptTokens) as prompt_tokens, avg(completionTokens) as completion_tokens, avg(totalTokens) as total_tokens by bin(5m)"
          region  = local.region
          title   = "Evaluation Token Usage"
          view    = "timeSeries"
          stacked = false
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/aws/lambda/${local.project_name}-optimise-cv' | filter message like /MONITORING/ | filter metric='OptimizationTokenUsage' | stats avg(wordCount) as word_count by bin(5m)"
          region  = local.region
          title   = "Optimization Word Count"
          view    = "timeSeries"
          stacked = false
        }
      },
      {
        type   = "log"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '/aws/lambda/${local.project_name}-optimise-cv' | filter message like /MONITORING/ | filter metric='EvaluationTokenUsage' | stats avg(wordCount) as word_count by bin(5m)"
          region  = local.region
          title   = "Evaluation Word Count"
          view    = "timeSeries"
          stacked = false
        }
      }
    ]
  })
}