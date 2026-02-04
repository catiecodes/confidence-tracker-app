import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Plus, Calendar, Target, Sparkles, X } from "lucide-react";

export default function App() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(5);
  const [showForm, setShowForm] = useState(false);

  // Practice planning inputs
  const [practiceHours, setPracticeHours] = useState(0);
  const [practiceMinutes, setPracticeMinutes] = useState(30);
  const [goalPoints, setGoalPoints] = useState(1);

  // Goal completion tracking
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingSkill, setCelebratingSkill] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [metTimeGoal, setMetTimeGoal] = useState(null);
  const [showGoalUpdate, setShowGoalUpdate] = useState(false);
  const [updatingSkill, setUpdatingSkill] = useState(null);

  // This will be replaced with actual user data from your portal
  const [userName, setUserName] = useState("Student");

  // Load data from storage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem("confidence-tracker-data");
        if (stored) {
          const data = JSON.parse(stored);
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.log("No existing data found, starting fresh");
      }
    };
    loadData();
  }, []);

  // Save data whenever skills change
  useEffect(() => {
    if (skills.length > 0) {
      try {
        localStorage.setItem(
          "confidence-tracker-data",
          JSON.stringify({ skills }),
        );
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
  }, [skills]);

  const addSkill = () => {
    // console.log('addSkill called, newSkill:', newSkill);
    if (!newSkill.trim()) {
      // console.log('Skill name is empty, returning');
      return;
    }

    const skill = {
      id: Date.now(),
      name: newSkill.trim(),
      entries: [],
    };

    console.log("Adding skill:", skill);
    setSkills([...skills, skill]);
    setNewSkill("");
    setShowForm(false);
  };

  const logConfidence = () => {
    if (!selectedSkill) return;

    const previousEntry =
      selectedSkill.entries[selectedSkill.entries.length - 1];
    const previousScore = previousEntry ? previousEntry.score : 0;

    // Use previous practice plan if time goal was met, otherwise use new plan
    const practicePlanToUse =
      metTimeGoal === true && previousEntry && previousEntry.practicePlan
        ? previousEntry.practicePlan
        : {
            hours: practiceHours,
            minutes: practiceMinutes,
            goalPoints: goalPoints,
          };

    const goalMet =
      previousEntry &&
      previousEntry.practicePlan &&
      confidenceScore >= previousScore + previousEntry.practicePlan.goalPoints;

    const reachedMastery = confidenceScore === 10;

    const updatedSkills = skills.map((skill) => {
      if (skill.id === selectedSkill.id) {
        return {
          ...skill,
          entries: [
            ...skill.entries,
            {
              date: new Date().toISOString().split("T")[0],
              timestamp: new Date().toISOString(),
              score: confidenceScore,
              metTimeGoal: metTimeGoal,
              practicePlan: practicePlanToUse,
              mastered: reachedMastery,
            },
          ],
        };
      }
      return skill;
    });

    setSkills(updatedSkills);

    // Check if goal was met (but not if they reached mastery - different celebration)
    if (goalMet && !reachedMastery) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setCelebratingSkill(selectedSkill);
      setShowCelebration(true);
    } else if (reachedMastery) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // Show mastery celebration (we'll handle this separately)
    }

    setConfidenceScore(5);
    setPracticeHours(0);
    setPracticeMinutes(30);
    setGoalPoints(1);
    setMetTimeGoal(null);
    setSelectedSkill(null);
  };

  const getChartData = (skill) => {
    return skill.entries.map((entry, index) => ({
      name: `Entry ${index + 1}`,
      date: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      confidence: entry.score,
    })); // Remove .reverse() here
  };

  const getLatestScore = (skill) => {
    if (skill.entries.length === 0) return null;
    return skill.entries[skill.entries.length - 1].score;
  };

  const getProgress = (skill) => {
    if (skill.entries.length < 2) return null;
    const first = skill.entries[0].score;
    const latest = skill.entries[skill.entries.length - 1].score;
    return latest - first;
  };

  const handleUpdateGoal = () => {
    setShowCelebration(false);
    setUpdatingSkill(celebratingSkill);
    setShowGoalUpdate(true);

    // Pre-fill with current goal
    const lastEntry =
      celebratingSkill.entries[celebratingSkill.entries.length - 1];
    if (lastEntry && lastEntry.practicePlan) {
      setGoalPoints(lastEntry.practicePlan.goalPoints);
    }

    setCelebratingSkill(null);
  };

  const submitGoalUpdate = () => {
    if (!updatingSkill) return;

    const updatedSkills = skills.map((skill) => {
      if (skill.id === updatingSkill.id) {
        const entries = [...skill.entries];
        const lastEntry = entries[entries.length - 1];

        // Update the last entry's goal points
        lastEntry.practicePlan.goalPoints = goalPoints;

        return { ...skill, entries };
      }
      return skill;
    });

    setSkills(updatedSkills);
    setShowGoalUpdate(false);
    setUpdatingSkill(null);
    setGoalPoints(1);
  };

  const removeSkill = (skillId) => {
    if (confirm("Are you sure you want to remove this skill?")) {
      setSkills(skills.filter((skill) => skill.id !== skillId));
    }
  };

  const getLatestPlan = (skill) => {
    if (skill.entries.length === 0) return null;
    const lastEntry = skill.entries[skill.entries.length - 1];
    return lastEntry.practicePlan || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .heading-font {
          font-family: 'Poppins', sans-serif;
        }
        
        .skill-card {
          background: white;
          border: 3px solid #3D3D3D;
          box-shadow: 8px 8px 0 #3D3D3D;
          transition: all 0.2s ease;
        }
        
        .skill-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 10px 10px 0 #3D3D3D;
        }
        
        .btn-primary {
          background: #1AA5A5;
          border: 3px solid #3D3D3D;
          box-shadow: 4px 4px 0 #3D3D3D;
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover {
          background: #168888;
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 #3D3D3D;
        }
        
        .btn-primary:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #3D3D3D;
        }
        
        .slider-container {
          position: relative;
          padding: 20px 0;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 12px;
          background: linear-gradient(to right, 
            #ef4444 0%, 
            #f59e0b 50%, 
            #1AA5A5 100%);
          border: 3px solid #3D3D3D;
          border-radius: 8px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          background: white;
          border: 4px solid #3D3D3D;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 32px;
          height: 32px;
          background: white;
          border: 4px solid #3D3D3D;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .score-display {
          font-size: 4rem;
          font-weight: 700;
          color: #1AA5A5;
        }
        
        .animate-in {
          animation: slideIn 0.4s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .progress-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
          border: 2px solid #3D3D3D;
        }
        
        .progress-positive {
          background: #86efac;
          color: #166534;
        }
        
        .progress-negative {
          background: #fca5a5;
          color: #991b1b;
        }
        
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background-color: #1AA5A5;
          position: fixed;
          animation: confetti-fall 3s ease-out forwards;
          z-index: 9999;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .checkbox-celebration {
          transition: all 0.3s ease;
        }
        
        .checkbox-celebration:checked {
          transform: scale(1.2);
        }
      `}</style>

      {/* Confetti Effect */}
      {showConfetti && (
        <div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: [
                  "#1AA5A5",
                  "#f59e0b",
                  "#ef4444",
                  "#22c55e",
                  "#3b82f6",
                ][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-in">
          <h1 className="heading-font text-5xl font-bold mb-2 text-gray-800">
            Confidence Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Welcome back, <span className="font-semibold text-teal-600">{userName}</span>
          </p>
          <p className="text-base text-gray-500">
            Track your coding skills and watch your confidence grow
          </p>
        </div>

        {/* Confidence Level Legend */}
        <div className="skill-card rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="heading-font text-2xl font-semibold text-gray-800 mb-4 text-center">
            Confidence Level Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-red-50 rounded-lg border-2 border-gray-800">
              <div className="font-bold text-2xl text-gray-800 mb-1">1-2</div>
              <div className="text-xs text-gray-700">Just learning</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border-2 border-gray-800">
              <div className="font-bold text-2xl text-gray-800 mb-1">3-4</div>
              <div className="text-xs text-gray-700">Following along</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border-2 border-gray-800">
              <div className="font-bold text-2xl text-gray-800 mb-1">5-6</div>
              <div className="text-xs text-gray-700">Understanding basics</div>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg border-2 border-gray-800">
              <div className="font-bold text-2xl text-gray-800 mb-1">7-8</div>
              <div className="text-xs text-gray-700">Solving problems</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-gray-800">
              <div className="font-bold text-2xl text-gray-800 mb-1">9-10</div>
              <div className="text-xs text-gray-700">Can teach others</div>
            </div>
          </div>
          <button
            onClick={() => {
              const details = document.getElementById('legend-details');
              details.classList.toggle('hidden');
            }}
            className="mt-4 text-sm text-teal-600 font-semibold hover:text-teal-700 mx-auto block"
          >
            View detailed descriptions ↓
          </button>
          <div id="legend-details" className="hidden mt-4 space-y-2 text-sm">
            <div className="flex gap-2"><strong>1:</strong> I just learned this exists</div>
            <div className="flex gap-2"><strong>2:</strong> I've seen examples of this</div>
            <div className="flex gap-2"><strong>3:</strong> I can follow along with guidance</div>
            <div className="flex gap-2"><strong>4:</strong> I finished assignments, but it feels fuzzy</div>
            <div className="flex gap-2"><strong>5:</strong> I understand the basics</div>
            <div className="flex gap-2"><strong>6:</strong> I can complete tasks independently</div>
            <div className="flex gap-2"><strong>7:</strong> I could redo assignments more quickly</div>
            <div className="flex gap-2"><strong>8:</strong> I can solve new problems with this skill</div>
            <div className="flex gap-2"><strong>9:</strong> I could teach this to another student</div>
            <div className="flex gap-2"><strong>10:</strong> I could teach this to a brand new developer</div>
          </div>
        </div>

        {/* Add New Skill Button */}
        {!showForm && (
          <div className="text-center mb-8 flex gap-4 justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2"
            >
              <Plus size={24} />
              Track a New Skill
            </button>

            {/* Testing: Clear All Data Button */}
            {skills.length > 0 && (
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    "Clear all data? This cannot be undone.",
                  );
                  if (confirmed) {
                    setSkills([]);
                    localStorage.removeItem("confidence-tracker-data");
                    window.location.reload();
                  }
                }}
                className="px-6 py-4 rounded-xl font-semibold text-base border-3 border-red-600 bg-white text-red-600 hover:bg-red-50"
              >
                Clear All Data
              </button>
            )}
          </div>
        )}

        {/* New Skill Form */}
        {showForm && (
          <div className="skill-card rounded-2xl p-8 mb-8 animate-in">
            <h2 className="heading-font text-3xl font-semibold mb-4 text-gray-800">
              What skill are you working on?
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="e.g., Unordered Lists, React Components, SQL..."
                className="flex-1 px-6 py-4 rounded-xl border-3 border-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-teal-300"
              />
              <button
                onClick={addSkill}
                className="btn-primary text-white px-8 py-4 rounded-xl font-bold text-lg"
              >
                Add Skill
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-8 py-4 rounded-xl font-bold text-lg border-3 border-gray-800 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skills Grid */}
        {skills.length === 0 && !showForm && (
          <div className="text-center py-20">
            <Target size={64} className="mx-auto mb-4 text-teal-500" />
            <p className="text-xl text-gray-600 font-medium">
              No skills tracked yet. Start building your confidence!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {skills.map((skill) => {
            const latestScore = getLatestScore(skill);
            const progress = getProgress(skill);
            const chartData = getChartData(skill);

            return (
              <div
                key={skill.id}
                className="skill-card rounded-2xl p-6 animate-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="heading-font text-2xl font-semibold text-gray-800 mb-1">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {skill.entries.length}{" "}
                      {skill.entries.length === 1 ? "entry" : "entries"} logged
                    </p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="mb-4 bg-teal-50 rounded-xl p-4 border-2 border-gray-800">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          stroke="#3D3D3D"
                        />
                        <YAxis
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          stroke="#3D3D3D"
                        />
                        <Tooltip
                          contentStyle={{
                            border: "2px solid #3D3D3D",
                            borderRadius: "8px",
                            fontWeight: "600",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="confidence"
                          stroke="#1AA5A5"
                          strokeWidth={4}
                          dot={{
                            fill: "#1AA5A5",
                            strokeWidth: 2,
                            r: 6,
                            stroke: "#3D3D3D",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {latestScore !== 10 && (
                  <button
                    onClick={() => {
                      setSelectedSkill(skill);
                      setConfidenceScore(latestScore || 5);

                      // Pre-fill practice plan from last entry if it exists
                      const lastEntry = skill.entries[skill.entries.length - 1];
                      if (lastEntry && lastEntry.practicePlan) {
                        setPracticeHours(lastEntry.practicePlan.hours);
                        setPracticeMinutes(lastEntry.practicePlan.minutes);
                        setGoalPoints(lastEntry.practicePlan.goalPoints);
                      }
                    }}
                    className="w-full btn-primary text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                  >
                    <Target size={20} />
                    Log New Score
                  </button>
                )}

                {/* Current Practice Plan */}
                {/* Current Practice Plan */}
                {(() => {
                  const plan = getLatestPlan(skill);
                  const isMastered = latestScore === 10;

                  if (isMastered) {
                    return (
                      <div className="mt-4 bg-yellow-50 rounded-xl p-4 border-2 border-yellow-500">
                        <p className="text-sm text-gray-700 leading-relaxed text-center">
                          <strong className="text-yellow-700">
                            🎉 Confidence level achieved!
                          </strong>
                          <br />
                          <span className="text-gray-600">
                            Your hard work has paid off!
                          </span>
                        </p>
                      </div>
                    );
                  }

                  if (!plan) return null;

                  const isFirstGoal = skill.entries.length === 1;

                  // Get score description
                  const getScoreDescription = (score) => {
                    const descriptions = {
                      1: "I just learned this exists",
                      2: "I've seen examples of this",
                      3: "I can follow along with guidance",
                      4: "I finished assignments, but it feels fuzzy",
                      5: "I understand the basics",
                      6: "I can complete tasks independently",
                      7: "I could redo assignments more quickly",
                      8: "I can solve new problems with this skill",
                      9: "I could teach this to another student",
                      10: "I could teach this to a brand new developer",
                    };
                    return descriptions[score] || "";
                  };

                  return (
                    <div className="mt-4 bg-white rounded-xl p-4 border-2 border-teal-500">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        My last score was <strong>{latestScore}</strong>, which
                        is "<em>{getScoreDescription(latestScore)}</em>". Over
                        the next week, I will study{" "}
                        <strong>
                          {plan.hours > 0 &&
                            `${plan.hours} ${plan.hours === 1 ? "hour" : "hours"}`}
                          {plan.hours > 0 && plan.minutes > 0 && " and "}
                          {plan.minutes > 0 && `${plan.minutes} minutes`}
                        </strong>{" "}
                        to increase my confidence in this skill.
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Celebration Modal */}
        {showCelebration && celebratingSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-gray-800 shadow-2xl animate-in">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="heading-font text-3xl font-bold mb-3 text-gray-800">
                  Goal Achieved!
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  You've reached your confidence goal for{" "}
                  <strong>{celebratingSkill.name}</strong>!
                </p>
                <p className="text-base text-gray-600 mb-8">
                  Would you like to set a new point goal?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateGoal}
                    className="flex-1 btn-primary text-white px-6 py-4 rounded-xl font-bold text-lg"
                  >
                    Yes, Update Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      setCelebratingSkill(null);
                    }}
                    className="flex-1 px-6 py-4 rounded-xl font-bold text-lg border-3 border-gray-800 bg-white hover:bg-gray-50"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Update Modal */}
        {showGoalUpdate && updatingSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-gray-800 shadow-2xl animate-in">
              <h2 className="heading-font text-3xl font-bold mb-4 text-gray-800">
                Update Your Goal
              </h2>
              <p className="text-base text-gray-600 mb-6">
                Skill: <strong>{updatingSkill.name}</strong>
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current goal:{" "}
                  <span className="text-teal-600">
                    {goalPoints} {goalPoints === 1 ? "point" : "points"}
                  </span>
                </label>
                <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                  New confidence point goal:
                </label>
                <select
                  value={goalPoints}
                  onChange={(e) => setGoalPoints(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                  <option value={1}>1 point</option>
                  <option value={2}>2 points</option>
                  <option value={3}>3 points</option>
                  <option value={4}>4 points</option>
                  <option value={5}>5 points</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={submitGoalUpdate}
                  className="flex-1 btn-primary text-white px-6 py-4 rounded-xl font-bold text-lg"
                >
                  Update Goal
                </button>
                <button
                  onClick={() => {
                    setShowGoalUpdate(false);
                    setUpdatingSkill(null);
                    setGoalPoints(1);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-lg border-3 border-gray-800 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Log Confidence Modal */}
        {selectedSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-6 z-50 overflow-y-auto pt-20">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full border-4 border-gray-800 shadow-2xl animate-in mb-20">
              <h2 className="heading-font text-4xl font-bold mb-2 text-gray-800">
                {selectedSkill.entries.length === 0
                  ? "Log Your Confidence"
                  : "Check In"}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Tracking: <strong>{selectedSkill.name}</strong>
              </p>

              {/* Time Goal Check (only for second entry) */}
              {selectedSkill.entries.length === 1 && metTimeGoal === null && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-800 mb-4">
                    Did you meet your practice time goal?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setMetTimeGoal(true)}
                      className="flex-1 btn-primary text-white px-6 py-4 rounded-xl font-bold text-lg"
                    >
                      Yes! ✓
                    </button>
                    <button
                      onClick={() => setMetTimeGoal(false)}
                      className="flex-1 px-6 py-4 rounded-xl font-bold text-lg border-3 border-gray-800 bg-white hover:bg-gray-50"
                    >
                      Not Yet
                    </button>
                  </div>
                </div>
              )}

              {/* Show confidence slider after answering time goal OR for first entry OR for entries after second */}
              {(selectedSkill.entries.length === 0 ||
                selectedSkill.entries.length >= 2 ||
                metTimeGoal !== null) && (
                <>
                  <div className="mb-6 bg-teal-50 rounded-xl p-4 border-2 border-teal-500">
                    <p className="text-base text-gray-700 italic">
                      Please take a moment to reflect on your confidence level
                      with this skill.
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="score-display heading-font">
                      {confidenceScore}
                    </div>
                    <p className="text-gray-500 font-semibold">out of 10</p>

                    {/* Description for current score */}
                    <div className="mt-3 text-sm font-medium text-gray-700 min-h-[40px]">
                      {confidenceScore === 1 && "I just learned this exists"}
                      {confidenceScore === 2 && "I've seen examples of this"}
                      {confidenceScore === 3 &&
                        "I can follow along with guidance"}
                      {confidenceScore === 4 &&
                        "I finished assignments, but it feels fuzzy"}
                      {confidenceScore === 5 && "I understand the basics"}
                      {confidenceScore === 6 &&
                        "I can complete tasks independently"}
                      {confidenceScore === 7 &&
                        "I could redo assignments more quickly"}
                      {confidenceScore === 8 &&
                        "I can solve new problems with this skill"}
                      {confidenceScore === 9 &&
                        "I could teach this to another student"}
                      {confidenceScore === 10 &&
                        "I could teach this to a brand new developer"}
                    </div>
                  </div>

                  <div className="slider-container mb-8">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={confidenceScore}
                      onChange={(e) =>
                        setConfidenceScore(parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mt-3 px-1">
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I just learned this exists"
                      >
                        1
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I've seen examples of this"
                      >
                        2
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I can follow along with guidance"
                      >
                        3
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I finished assignments, but it feels fuzzy"
                      >
                        4
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I understand the basics"
                      >
                        5
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I can complete tasks independently"
                      >
                        6
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I could redo assignments more quickly"
                      >
                        7
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I can solve new problems with this skill"
                      >
                        8
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I could teach this to another student"
                      >
                        9
                      </span>
                      <span
                        className="text-center"
                        style={{ width: "9%" }}
                        title="I could teach this to a brand new developer"
                      >
                        10
                      </span>
                    </div>
                  </div>

                  {/* Practice Plan Section - only show for first entry */}
                  {selectedSkill.entries.length === 0 && (
                    <div className="bg-teal-50 rounded-xl p-6 mb-6 border-2 border-gray-800">
                      <h3 className="heading-font text-xl font-semibold text-gray-800 mb-4">
                        Your Practice Plan
                      </h3>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Time to practice this week:
                        </label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">
                              Hours
                            </label>
                            <select
                              value={practiceHours}
                              onChange={(e) =>
                                setPracticeHours(parseInt(e.target.value))
                              }
                              className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-teal-300"
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">
                              Minutes
                            </label>
                            <select
                              value={practiceMinutes}
                              onChange={(e) =>
                                setPracticeMinutes(parseInt(e.target.value))
                              }
                              className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-teal-300"
                            >
                              {[0, 15, 30, 45].map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confidence point goal:
                        </label>
                        <select
                          value={goalPoints}
                          onChange={(e) =>
                            setGoalPoints(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-teal-300"
                        >
                          <option value={1}>1 point</option>
                          <option value={2}>2 points</option>
                          <option value={3}>3 points</option>
                          <option value={4}>4 points</option>
                          <option value={5}>5 points</option>
                        </select>
                      </div>

                      {/* Practice Plan Summary */}
                      <div className="bg-white rounded-lg p-4 border-2 border-gray-800">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>My commitment:</strong> By next week at this
                          time, my plan is to spend{" "}
                          <span className="font-bold text-teal-600">
                            {practiceHours > 0 &&
                              `${practiceHours} ${practiceHours === 1 ? "hour" : "hours"}`}
                            {practiceHours > 0 &&
                              practiceMinutes > 0 &&
                              " and "}
                            {practiceMinutes > 0 &&
                              `${practiceMinutes} minutes`}
                          </span>{" "}
                          practicing this skill. My goal is to increase my
                          confidence by{" "}
                          <span className="font-bold text-teal-600">
                            {goalPoints} {goalPoints === 1 ? "point" : "points"}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={logConfidence}
                      className="flex-1 btn-primary text-white px-6 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center gap-2"
                    >
                      <Calendar size={20} />
                      Log Score
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSkill(null);
                        setConfidenceScore(5);
                        setPracticeHours(0);
                        setPracticeMinutes(30);
                        setGoalPoints(1);
                        setMetTimeGoal(null);
                      }}
                      className="px-6 py-4 rounded-xl font-bold text-lg border-3 border-gray-800 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Today:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
