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
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6">Personal Information Form</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium">Age:</label>
          <select name="age" value={form.age} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Age Range</option>
            <option value="Under 18">Under 18</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="50+">50+</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Gender:</label>
          <select name="gender" value={form.gender} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Pregnancy Status:</label>
          <select name="pregnancyStatus" value={form.pregnancyStatus} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Status</option>
            <option value="Not Pregnant">Not Pregnant</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Postpartum">Postpartum</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Diet Preferences:</label>
          <select name="dietPreferences" value={form.dietPreferences} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Diet Type</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="NonVegetarian">Non-Vegetarian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Specific Diet Type:</label>
          <select name="specificDiet" value={form.specificDiet} onChange={handleChange} required className="w-full p-2 border rounded">
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

        <div>
          <label className="block font-medium">Fitness Goals:</label>
          <select name="fitnessGoals" value={form.fitnessGoals} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="General Fitness">General Fitness</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Additional Info:</label>
          <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} placeholder="Any extra details?" className="w-full p-2 border rounded"></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
          Submit
        </button>
      </form>
    </div>
  );
}

