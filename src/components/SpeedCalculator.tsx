import { useState } from "react";
import { Gauge, Clock, Zap } from "lucide-react";
import { SpeedCalculation } from "../types/youtube";
import { calculateSpeedDuration } from "../services/youtube";

interface SpeedCalculatorProps {
  totalDuration: number;
}

export default function SpeedCalculator({
  totalDuration,
}: SpeedCalculatorProps) {
  const [customSpeed, setCustomSpeed] = useState<number>(1.25);

  const predefinedSpeeds: SpeedCalculation[] = [
    { speed: 1, label: "Normal", duration: totalDuration, formatted: "" },
    { speed: 1.25, label: "1.25x", duration: 0, formatted: "" },
    { speed: 1.5, label: "1.5x", duration: 0, formatted: "" },
    { speed: 1.75, label: "1.75x", duration: 0, formatted: "" },
    { speed: 2, label: "2x", duration: 0, formatted: "" },
  ].map((speed) => {
    const calc = calculateSpeedDuration(totalDuration, speed.speed);
    return {
      ...speed,
      duration: calc.duration,
      formatted: calc.formatted,
    };
  });

  const customSpeedCalc = calculateSpeedDuration(totalDuration, customSpeed);

  return (
    <div
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl border border-white/30 dark:border-gray-700/30 p-6 transition-all duration-300 animate-scale opacity-0"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-fuchsia-500 rounded-full p-2 mr-3 shadow-md">
          <Gauge className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Playback Speed Calculator
        </h3>
      </div>

      {/* Predefined Speeds */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {predefinedSpeeds.map((speed) => (
          <div
            key={speed.speed}
            className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.03] hover:shadow-md ${
              speed.speed === 1
                ? "border-blue-200 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-900/30"
                : "border-purple-200 dark:border-purple-700 bg-purple-50/80 dark:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600"
            }`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {speed.speed === 1 ? (
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                ) : (
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-1" />
                )}
                <span
                  className={`font-semibold ${
                    speed.speed === 1
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {speed.label}
                </span>
              </div>
              <p
                className={`text-sm font-medium ${
                  speed.speed === 1
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-purple-600 dark:text-purple-400"
                }`}
              >
                {speed.formatted}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Speed */}
      <div className="bg-gradient-to-r from-orange-50/90 to-red-50/90 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200/50 dark:border-orange-800/50 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Custom Speed:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0.25"
                max="3"
                step="0.05"
                value={customSpeed}
                onChange={(e) =>
                  setCustomSpeed(parseFloat(e.target.value) || 1)
                }
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                x
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full shadow-sm">
            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-orange-700 dark:text-orange-300">
              {customSpeedCalc.formatted}
            </span>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          <p className="flex items-center">
            <span className="inline-block mr-1">💡</span>
            Tip: Most people can comfortably watch at 1.25x-1.5x speed
          </p>
        </div>
      </div>

      {/* Time Saved */}
      <div className="mt-4 p-3 bg-green-50/90 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="text-center">
          <p
            className={`text-sm ${
              customSpeed >= 1
                ? "text-green-700 dark:text-green-300"
                : "text-red-600 dark:text-red-400"
            }  font-medium`}
          >
            <span className="font-semibold">
              Time {customSpeed >= 1 ? "saved" : "lost"} at {customSpeed}x
              speed:{" "}
            </span>
            <span className="bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md ml-1 inline-block">
              {calculateSpeedDuration(
                totalDuration - customSpeedCalc.duration,
                1
              ).formatted === ""
                ? calculateSpeedDuration(
                    customSpeedCalc.duration - totalDuration,
                    1
                  ).formatted === ""
                  ? "0s"
                  : calculateSpeedDuration(
                      customSpeedCalc.duration - totalDuration,
                      1
                    ).formatted
                : calculateSpeedDuration(
                    totalDuration - customSpeedCalc.duration,
                    1
                  ).formatted}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
