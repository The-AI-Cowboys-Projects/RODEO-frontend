import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  BellAlertIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'

// Color classes for slider inputs
const colorClasses = {
  purple: { bg: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', accent: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500' },
  blue: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', accent: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500' },
  emerald: { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', accent: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500' },
  amber: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', accent: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500' },
  rose: { bg: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', accent: 'bg-rose-500', text: 'text-rose-400', ring: 'ring-rose-500' },
}

// Slider input component with cool styling and editable value - defined outside to prevent re-creation
function SliderInput({ label, icon: Icon, value, onChange, min, max, step = 1, unit = '', color = 'purple' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const c = colorClasses[color]
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const handleEditClick = () => {
    setEditValue(value.toString())
    setIsEditing(true)
  }

  const handleEditComplete = () => {
    const parsed = parseFloat(editValue.replace(/,/g, ''))
    if (!isNaN(parsed)) {
      // Clamp to min/max
      const clamped = Math.min(max, Math.max(min, parsed))
      onChange(clamped)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditComplete()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className={`bg-gradient-to-r ${c.bg} p-4 rounded-xl border ${c.border} group hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${c.accent}/20 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-1">
            {unit === '$' && <span className={`${c.text} font-bold text-lg`}>$</span>}
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-24 font-bold text-lg text-right px-2 py-0.5 rounded-lg border-0 ring-2 ${c.ring} focus:outline-none ${c.text} ${isDarkMode ? 'bg-slate-800/80' : 'bg-gray-100'}`}
            />
            {unit !== '$' && unit && <span className={`${c.text} font-bold text-lg`}>{unit}</span>}
          </div>
        ) : (
          <div
            onClick={handleEditClick}
            className={`${c.text} font-bold text-lg cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded-lg transition-colors duration-200`}
            title="Click to edit"
          >
            {unit === '$' ? `$${value.toLocaleString()}` : `${value.toLocaleString()}${unit}`}
          </div>
        )}
      </div>
      <div className="relative">
        <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`}>
          <div
            className={`h-full ${c.accent} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{unit === '$' ? `$${min.toLocaleString()}` : `${min}${unit}`}</span>
        <span>{unit === '$' ? `$${max.toLocaleString()}` : `${max}${unit}`}</span>
      </div>
    </div>
  )
}

export default function RoiCalculator() {
  const { isDarkMode } = useTheme()
  const [inputs, setInputs] = useState({
    analysts: 5,
    avgSalary: 95000,
    alertsPerDay: 500,
    avgTriageTimeManual: 15, // minutes
    falsePositiveRate: 60, // percentage
    rodeoInvestment: 150000, // Annual cost paid for RODEO
  })

  const [results, setResults] = useState({
    annualCost: 0,
    timeSavedHours: 0,
    timeSavedCost: 0,
    falsePositivesSaved: 0,
    netSavings: 0,
    roi: 0,
    paybackMonths: 0,
  })

  const [animatedRoi, setAnimatedRoi] = useState(0)

  useEffect(() => {
    calculateROI()
  }, [inputs])

  // Animate ROI number
  useEffect(() => {
    const target = results.roi
    const duration = 1000
    const steps = 30
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedRoi(target)
        clearInterval(timer)
      } else {
        setAnimatedRoi(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [results.roi])

  const calculateROI = () => {
    const { analysts, avgSalary, alertsPerDay, avgTriageTimeManual, falsePositiveRate, rodeoInvestment } = inputs
    const rodeoAnnualCost = rodeoInvestment

    // Manual process calculations
    const hourlyRate = avgSalary / 2080 // 2080 working hours per year
    const annualAlerts = alertsPerDay * 365
    const manualTriageHoursPerYear = (annualAlerts * avgTriageTimeManual) / 60
    const manualTriageCostPerYear = manualTriageHoursPerYear * hourlyRate

    // RODEO improvements
    const rodeoTriageTime = 0.5 // minutes (automation reduces to 30 seconds)
    const rodeoFalsePositiveRate = 12 // percentage
    const rodeoTriageHoursPerYear = (annualAlerts * rodeoTriageTime) / 60
    const rodeoTriageCostPerYear = rodeoTriageHoursPerYear * hourlyRate

    // Time savings from faster triage
    const timeSavedHours = manualTriageHoursPerYear - rodeoTriageHoursPerYear
    const timeSavedCost = timeSavedHours * hourlyRate

    // False positive savings
    const manualFalsePositives = annualAlerts * (falsePositiveRate / 100)
    const rodeoFalsePositives = annualAlerts * (rodeoFalsePositiveRate / 100)
    const falsePositivesSaved = manualFalsePositives - rodeoFalsePositives
    const avgFalsePositiveInvestigationMinutes = 30 // avg 30 min per false positive investigation
    const falsePositiveCostSavings = (falsePositivesSaved * avgFalsePositiveInvestigationMinutes / 60) * hourlyRate

    // Total savings (operational cost reduction)
    const totalAnnualSavings = timeSavedCost + falsePositiveCostSavings

    // Net savings (total savings minus RODEO investment)
    const netAnnualSavings = totalAnnualSavings - rodeoAnnualCost

    // ROI Formula: ((Gain - Investment) / Investment) × 100
    const roi = ((netAnnualSavings / rodeoAnnualCost) * 100).toFixed(1)

    // Payback period in months
    const monthlyAverageSavings = totalAnnualSavings / 12
    const paybackMonths = monthlyAverageSavings > 0 ? (rodeoAnnualCost / monthlyAverageSavings).toFixed(1) : 0

    setResults({
      annualCost: rodeoAnnualCost,
      timeSavedHours: timeSavedHours.toFixed(0),
      timeSavedCost: timeSavedCost.toFixed(0),
      totalAnnualSavings: totalAnnualSavings.toFixed(0),
      falsePositivesSaved: falsePositivesSaved.toFixed(0),
      netSavings: netAnnualSavings.toFixed(0),
      roi: parseFloat(roi),
      paybackMonths: parseFloat(paybackMonths),
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  // Calculate ROI ring percentage (capped at 100% for visual)
  const roiPercentage = Math.min(results.roi / 5, 100)
  const circumference = 2 * Math.PI * 70

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900 to-blue-900/30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className={`relative backdrop-blur-xl rounded-2xl shadow-2xl p-8 border ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full" />
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                ROI Calculator
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>See your return on investment with R-O-D-E-O</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/30">
            <SparklesIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium text-sm">Live Calculation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-purple-400" />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configure Your Environment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SliderInput
                label="Security Analysts"
                icon={UserGroupIcon}
                value={inputs.analysts}
                onChange={(v) => handleInputChange('analysts', v)}
                min={1}
                max={50}
                color="purple"
              />
              <SliderInput
                label="Average Salary"
                icon={BanknotesIcon}
                value={inputs.avgSalary}
                onChange={(v) => handleInputChange('avgSalary', v)}
                min={50000}
                max={200000}
                step={5000}
                unit="$"
                color="emerald"
              />
              <SliderInput
                label="Alerts Per Day"
                icon={BellAlertIcon}
                value={inputs.alertsPerDay}
                onChange={(v) => handleInputChange('alertsPerDay', v)}
                min={50}
                max={2000}
                step={50}
                color="blue"
              />
              <SliderInput
                label="Manual Triage Time"
                icon={ClockIcon}
                value={inputs.avgTriageTimeManual}
                onChange={(v) => handleInputChange('avgTriageTimeManual', v)}
                min={5}
                max={60}
                unit=" min"
                color="amber"
              />
              <SliderInput
                label="False Positive Rate"
                icon={ExclamationTriangleIcon}
                value={inputs.falsePositiveRate}
                onChange={(v) => handleInputChange('falsePositiveRate', v)}
                min={10}
                max={90}
                unit="%"
                color="rose"
              />
              <SliderInput
                label="R-O-D-E-O Investment"
                icon={CurrencyDollarIcon}
                value={inputs.rodeoInvestment}
                onChange={(v) => handleInputChange('rodeoInvestment', v)}
                min={50000}
                max={500000}
                step={10000}
                unit="$"
                color="purple"
              />
            </div>
          </div>

          {/* ROI Ring Display */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl scale-125" />

              {/* SVG Ring */}
              <svg className="w-[36rem] h-[36rem] transform -rotate-90 relative" viewBox="0 0 192 192">
                {/* Background ring */}
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  fill="none"
                  stroke="rgba(100, 100, 100, 0.2)"
                  strokeWidth="12"
                />
                {/* Progress ring */}
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  fill="none"
                  stroke="url(#roiGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (roiPercentage / 100) * circumference}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl leading-none font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {animatedRoi}%
                </span>
                <span className="text-gray-400 text-lg font-medium mt-1">ROI</span>
              </div>
            </div>

            {/* Payback period */}
            <div className="mt-6 text-center">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{results.paybackMonths} months</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payback Period</div>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 rounded-xl p-5 border border-green-500/30 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Total Savings</span>
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${parseInt(results.totalAnnualSavings || results.timeSavedCost).toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>per year</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/20 rounded-xl p-5 border border-purple-500/30 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2">
              <BanknotesIcon className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Net Savings</span>
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${parseInt(results.netSavings).toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>after investment</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-xl p-5 border border-blue-500/30 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Hours Saved</span>
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {parseInt(results.timeSavedHours).toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>per year</div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-xl p-5 border border-amber-500/30 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">False Positives Eliminated</span>
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {parseInt(results.falsePositivesSaved).toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>per year</div>
          </div>
        </div>

        {/* Benefits List */}
        <div className={`mt-8 rounded-xl p-6 border ${isDarkMode ? 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <SparklesIcon className="w-5 h-5 text-purple-400" />
            Additional Benefits Included
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              '97% faster threat detection',
              '98% reduction in manual triage',
              'Reduced analyst burnout',
              '24/7 automated monitoring',
              'Instant threat prioritization',
              'Focus on strategic initiatives'
            ].map((benefit, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-3 h-3 text-green-400" />
                </div>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="mt-6 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-blue-900/40 rounded-xl p-4 border border-purple-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`text-center sm:text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              With <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{inputs.analysts}</strong> analysts processing{' '}
              <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{inputs.alertsPerDay.toLocaleString()}</strong> alerts/day
            </div>
            <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full">
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              <span className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                R-O-D-E-O saves <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{parseInt(results.timeSavedHours).toLocaleString()}</strong> hours/year
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
