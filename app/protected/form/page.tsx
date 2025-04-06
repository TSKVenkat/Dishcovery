"use client";

import { handleFormSubmit } from "@/app/actions";
import { encodedRedirect } from "@/utils/utils";
import { useState } from "react";

export default function DataForm() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    pregnancyStatus: "",
    dietPreferences: "",
    specificDiet: "",
    fitnessGoals: "",
    additionalInfo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    await handleFormSubmit(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 to-transparent opacity-20" />
      
      <div className="max-w-lg mx-auto p-6 sm:p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Personal Information Form
          </h2>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Age:</label>
              <select 
                name="age" 
                value={form.age} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Age Range</option>
                <option value="Under 18">Under 18</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-50">36-50</option>
                <option value="50+">50+</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Gender:</label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Pregnancy Status:</label>
              <select 
                name="pregnancyStatus" 
                value={form.pregnancyStatus} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Status</option>
                <option value="Not Pregnant">Not Pregnant</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Postpartum">Postpartum</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Diet Preferences:</label>
              <select 
                name="dietPreferences" 
                value={form.dietPreferences} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Diet Type</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="NonVegetarian">Non-Vegetarian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Specific Diet Type:</label>
              <select 
                name="specificDiet" 
                value={form.specificDiet} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Specific Diet</option>
                <option value="Lacto-Vegetarian">Lacto-Vegetarian</option>
                <option value="Ovo-Vegetarian">Ovo-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Keto">Keto</option>
                <option value="Paleo">Paleo</option>
                <option value="High-Protein">High-Protein</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Dairy-Free">Dairy-Free</option>
                <option value="Mediterranean Diet">Mediterranean Diet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Fitness Goals:</label>
              <select 
                name="fitnessGoals" 
                value={form.fitnessGoals} 
                onChange={handleChange} 
                required 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Select Goal</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Additional Info:</label>
              <textarea 
                name="additionalInfo" 
                value={form.additionalInfo} 
                onChange={handleChange} 
                placeholder="Any extra details?" 
                className="w-full p-2.5 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors min-h-[100px]"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2.5 px-4 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

