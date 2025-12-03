import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { analyticsApi } from '../lib/api'

// Star rating component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// Stat card component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  color = 'indigo'
}: { 
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon: React.ReactNode
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'blue'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default function AIAgentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['ai-agent-analytics', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getAIAgentStats(timeRange)
      return response.data.data  // axios wraps response, API returns { data: { ... } }
    },
  })

  // Fetch learning examples
  const { data: learningExamples } = useQuery({
    queryKey: ['ai-learning-examples'],
    queryFn: async () => {
      const response = await analyticsApi.getLearningExamples(10)
      return response.data.data  // axios wraps response, API returns { data: { ... } }
    },
  })

  const stats = analyticsData?.stats || {
    totalDrafts: 0,
    avgQualityScore: 0,
    helpfulRate: 0,
    approvalRate: 0,
    editRate: 0,
    rejectRate: 0,
    avgProcessingTime: 0,
    totalFeedback: 0
  }

  const qualityDistribution = analyticsData?.qualityDistribution || []
  const intentPerformance = analyticsData?.intentPerformance || []
  // recentFeedback available for future use: analyticsData?.recentFeedback

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Agent Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor AI performance, quality scores, and learning progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total AI Drafts"
          value={stats.totalDrafts}
          subtitle="Responses generated"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="indigo"
        />
        <StatCard
          title="Average Quality"
          value={`${stats.avgQualityScore.toFixed(1)}/5`}
          subtitle="Staff rating"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Helpful Rate"
          value={`${stats.helpfulRate.toFixed(0)}%`}
          subtitle="Saved staff time"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Approval Rate"
          value={`${stats.approvalRate.toFixed(0)}%`}
          subtitle="Sent without edits"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quality Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quality Score Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((score) => {
              const item = qualityDistribution.find((d: any) => d.score === score) || { score, count: 0, percentage: 0 }
              return (
                <div key={score} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{score}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Response Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approved (No Edits)</p>
                  <p className="text-xs text-gray-500">Sent exactly as AI generated</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-green-700">{stats.approvalRate.toFixed(0)}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Edited Before Sending</p>
                  <p className="text-xs text-gray-500">Modified by staff</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-yellow-700">{stats.editRate.toFixed(0)}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rejected</p>
                  <p className="text-xs text-gray-500">Staff wrote new response</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-red-700">{stats.rejectRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intent Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance by Intent</h2>
        {intentPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Quality</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helpful %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {intentPerformance.map((intent: any) => (
                  <tr key={intent.intent} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                      {intent.intent.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{intent.count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(intent.avgQuality)} size="sm" />
                        <span className="text-sm text-gray-600">{intent.avgQuality.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        intent.helpfulRate >= 80 ? 'bg-green-100 text-green-800' :
                        intent.helpfulRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {intent.helpfulRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {intent.trend > 0 ? (
                        <span className="text-green-600">↑ Improving</span>
                      ) : intent.trend < 0 ? (
                        <span className="text-red-600">↓ Declining</span>
                      ) : (
                        <span className="text-gray-500">→ Stable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No intent data available yet. Start approving AI drafts to see performance by intent.</p>
        )}
      </div>

      {/* Learning Examples */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Learning Examples</h2>
            <p className="text-sm text-gray-500">High-quality responses (4-5 stars) used to improve AI</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {learningExamples?.examples?.length || 0} examples
          </span>
        </div>
        
        {learningExamples?.examples?.length > 0 ? (
          <div className="space-y-4">
            {learningExamples.examples.slice(0, 5).map((example: any) => (
              <div key={example.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                      {example.intent?.replace(/_/g, ' ') || 'General'}
                    </span>
                    <StarRating rating={example.quality_score} size="sm" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {example.created_at ? formatDistanceToNow(new Date(example.created_at), { addSuffix: true }) : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Customer Message</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{example.customer_message}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">AI Response</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{example.ai_response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No learning examples yet</p>
            <p className="text-xs text-gray-400">Rate AI responses 4-5 stars to add them as learning examples</p>
          </div>
        )}
      </div>
    </div>
  )
}

