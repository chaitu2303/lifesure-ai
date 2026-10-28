import React from 'react';
import { Plus, Trash2, GraduationCap, Heart, Target, HelpCircle } from 'lucide-react';
import { AssessmentInput, GoalItem } from '../../types';

interface Step4Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step4Goals: React.FC<Step4Props> = ({ data, onChange }) => {
  const goals = data.future_goals || [];

  const handleAddGoal = (name: string = 'New Milestone Goal', amount: number = 50000, years: number = 10) => {
    const newGoal: GoalItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      target_amount: amount,
      years_until_goal: years,
    };
    onChange({ future_goals: [...goals, newGoal] });
  };

  const handleUpdateGoal = (index: number, updates: Partial<GoalItem>) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], ...updates };
    onChange({ future_goals: updated });
  };

  const handleRemoveGoal = (index: number) => {
    const updated = goals.filter((_, i) => i !== index);
    onChange({ future_goals: updated });
  };

  const totalGoalsToday = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Step Header with Total Goals Pill */}
      <div className="border-b border-[#E6E4DF] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
            Stage 04 / 07 · Future Milestones
          </span>
          <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
            Family Milestone Commitments
          </h2>
          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
            Specific future capital requirements you want guaranteed, such as children's university tuition or family reserves.
          </p>
        </div>

        <div className="border border-[#E6E4DF] bg-[#FAF9F5] px-4 py-2 rounded-sm text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Cumulative Target</div>
          <div className="text-lg font-mono font-bold text-[#0B132B]">
            ${totalGoalsToday.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-2 font-semibold">
          Standard Benchmark Milestones:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleAddGoal("Child Higher Education", 2500000, 12)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-white hover:bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm text-[#0B132B] transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>+ Higher Education (₹25L · 12 yrs)</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddGoal("Parent Healthcare Contingency", 1500000, 6)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-white hover:bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm text-[#0B132B] transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Healthcare Buffer (₹15L · 6 yrs)</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddGoal("Custom Family Reserve", 2000000, 10)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-white hover:bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm text-[#0B132B] transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-[#047857]" />
            <span>+ Custom Reserve (₹20L · 10 yrs)</span>
          </button>
        </div>
      </div>

      {/* Goals Dynamic List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#E6E4DF] bg-[#FAF9F5] rounded-sm">
            <Target className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm font-serif text-[#0B132B]">No discrete future goals added yet</p>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
              If your family has specific education or milestone commitments, add them to project inflation-adjusted capital.
            </p>
            <button
              type="button"
              onClick={() => handleAddGoal()}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-white bg-[#0B132B] hover:bg-[#1D4ED8] rounded-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Goal</span>
            </button>
          </div>
        ) : (
          goals.map((goal, idx) => (
            <div
              key={goal.id || idx}
              className="p-5 bg-white border border-[#E6E4DF] rounded-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
                  Goal 0{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(idx)}
                  className="text-xs text-[#94A3B8] hover:text-rose-700 flex items-center space-x-1 font-mono transition-colors"
                  title="Remove this goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => handleUpdateGoal(idx, { name: e.target.value })}
                    placeholder="e.g. Daughter University Fund"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                    Target Lump Sum ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B] font-mono text-xs">
                      $
                    </div>
                    <input
                      type="number"
                      min={1000}
                      step={5000}
                      value={goal.target_amount || ''}
                      onChange={(e) => handleUpdateGoal(idx, { target_amount: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2.5 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                    Due In (Years)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={35}
                      value={goal.years_until_goal || 1}
                      onChange={(e) => handleUpdateGoal(idx, { years_until_goal: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                    />
                    <span className="text-xs font-mono text-[#64748B]">yrs</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {goals.length > 0 && (
          <button
            type="button"
            onClick={() => handleAddGoal()}
            className="w-full py-3 border border-dashed border-[#E6E4DF] hover:border-[#1D4ED8] text-xs font-mono uppercase tracking-wider text-[#1D4ED8] bg-[#FAF9F5] rounded-sm transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Milestone Goal</span>
          </button>
        )}
      </div>

    </div>
  );
};
