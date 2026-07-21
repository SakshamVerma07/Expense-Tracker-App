import {
  Check,
  ChevronDownIcon,
  GraduationCap,
  Image,
  UserCircle2,
  X,
} from "lucide-react";
import React, { createElement, useEffect, useState, useMemo } from "react";
import { colorList } from "../assets/assets";
import profileIcons from "../components/profilePics";
import { countries } from "countries-list";
import { currencies } from "countries-list/currencies";
import Select from "react-select";
import { api } from "../context/authContext";
import { supabase } from "../context/authContext";
import { Navigate, useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const [profileIconMenuOpen, setProfileIconMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [profileIconIndex, setProfileIconIndex] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currencyDisplay, setCurrencyDisplay] = useState("");
  const [selectedImpUpdates, setSelectedImpUpdates] = useState(true);
  const [selectedMonthlyUpdates, setSelectedMonthlyUpdates] = useState(true);
  const [selectedBetaTesting, setSelectedBetaTesting] = useState(false);

  const navigate = useNavigate();

  const handleChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const objects = Object.fromEntries(formData.entries());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(objects.email.trim())) {
      alert("Please enter a valid looking email structure!");
      return;
    }
    let formReturnData = {
      username: objects.username,
      profileIcon: profileIconIndex,
      firstName: objects.first_name,
      lastName: objects.last_name,
      email: objects.email.trim(),
      country: selectedCountry,
      currency: currencyDisplay,
      impUpdates: selectedImpUpdates,
      monthlyUpdates: selectedMonthlyUpdates,
      betaTesting: selectedBetaTesting,
    };

    // Try signing up
    if (isPasswordValidChk && arePassesSame) {
      const { data, error } = await supabase.auth.signUp({
        email: objects.email,
        password: password,
      });

      if (error) {
        console.error("Error signing up:", error.message);
        return;
      }

      formReturnData.provider_uid = data.user.id;

      const backendUserGen = await api.post("/new_user", formReturnData);
      console.log(backendUserGen);
      if (backendUserGen.status == 200) {
        navigate("/dashboard");
        console.log("yo");
      }
      console.log(formReturnData);
    }
  };

  const openProfileIconMenu = () => {
    setProfileIconMenuOpen(true);
  };

  const countryList = useMemo(() => {
    return Object.entries(countries)
      .map(([code, data]) => {
        const currencyCode = data.currency[0] || "";
        // 2. Fetch the symbol from the currencies dictionary
        const currencySymbol = currencies[currencyCode]?.symbol || "";
        const currencyName = currencies[currencyCode]?.name || "";

        return {
          code,
          name: data.name,
          currencyCode,
          currencySymbol,
          currencyName,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);

    const countryData = countryList.find((c) => c.code === countryCode);
    if (countryData && countryData.currencyCode) {
      // 3. Format it beautifully: "USD ($)"
      const symbolStr = countryData.currencySymbol
        ? ` (${countryData.currencySymbol}) - ${countryData.currencyName}`
        : "";
      setCurrencyDisplay(`${countryData.currencyCode}${symbolStr}`);
    } else {
      setCurrencyDisplay("");
    }
  };

  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(rules);
  const isPasswordValidChk = Object.values(rules).every(Boolean);

  const arePassesSame = confirmPassword == password && password != "";

  return (
    <>
      <header className="border border-black p-3 w-full gap-2 flex justify-center items-center text-2xl font-bold">
        <GraduationCap size={40} />
        Campus Cash
      </header>
      <main className="flex flex-col justify-center items-center p-5">
        {profileIconMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
              zIndex: 1000, // Make sure it sits above other elements
            }}
            onClick={() => setProfileIconMenuOpen(false)}
          />
        )}

        <div className="">
          <form action="" onSubmit={handleChange}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Register
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 w-full">
                  {/* Username */}
                  <div className="sm:col-span-full">
                    <label
                      htmlFor="username"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Username
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-chart-2">
                        {/* <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6">
                          workcation.com/
                        </div> */}

                        <input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="janesmith"
                          className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Pic Section */}
                  <div className="col-span-full w-full">
                    <label
                      htmlFor="photo"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Profile Icon
                    </label>
                    <div className="mt-2 flex items-center gap-x-3 relative">
                      {
                        <div
                          key={profileIcons[profileIconIndex].id}
                          id={profileIcons[profileIconIndex].id}
                          className="size-11 rounded-full p-2.5 shadow-md shadow-blue-500/10"
                          style={{
                            backgroundColor:
                              profileIcons[profileIconIndex].bgColor,
                            color: profileIcons[profileIconIndex].color,
                          }}
                        >
                          {profileIcons[profileIconIndex].icon}
                        </div>
                      }
                      <button
                        type="button"
                        onClick={openProfileIconMenu}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
                      >
                        Change
                      </button>
                      {
                        <div
                          className={`z-1001 absolute flex-wrap overflow-scroll scrollbar-none shadow-md justify-center items-center gap-2 flex ${profileIconMenuOpen ? "size-42 bg-white border border-border p-2" : "size-0"} duration-300 top-0 left-0 rounded-md `}
                          aria-hidden={profileIconMenuOpen ? true : false}
                        >
                          {profileIconMenuOpen &&
                            profileIcons.map((icon) => {
                              return (
                                <div
                                  key={icon.id}
                                  id={icon.id}
                                  className="size-11 rounded-full p-2.5 shadow-md shadow-blue-500/10"
                                  style={{
                                    backgroundColor: icon.bgColor,
                                    color: icon.color,
                                  }}
                                  onClick={() => {
                                    setProfileIconIndex(icon.id - 1);
                                    setProfileIconMenuOpen(false);
                                  }}
                                >
                                  {icon.icon}
                                </div>
                              );
                            })}
                        </div>
                      }
                    </div>
                  </div>

                  <p className=" text-sm/6 text-gray-600 sm:col-span-full">
                    Make a strong password, for logging in to the app when
                    needed.
                  </p>

                  {/* Password */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-chart-2">
                        <input
                          required
                          onChange={(e) => setPassword(e.target.value)}
                          id="password"
                          name="password"
                          type="password"
                          placeholder=""
                          className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="confirm_password"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Confirm Password
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-chart-2">
                        <input
                          required
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          id="confirm_password"
                          name="confirm_password"
                          type="confirm_password"
                          placeholder=""
                          className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                    <p
                      className={`text-sm/6 ${arePassesSame ? "text-chart-1" : "text-red-500"} font-semibold ${confirmPassword == "" ? "hidden" : ""}`}
                    >
                      {` Passwords ${arePassesSame ? "Match" : "don't match"}`}
                    </p>
                  </div>

                  <div className=" text-sm/6 text-gray-600 flex flex-col sm:col-span-full">
                    <span className="font-bold">Password Rules</span>
                    <ul className="list-disc ps-5 flex flex-col">
                      <li
                        className={`flex gap-1 items-center font-semibold ${isPasswordValid[0] ? "text-chart-1" : "text-red-500"}`}
                      >
                        {isPasswordValid[0] ? (
                          <Check size={20} />
                        ) : (
                          <X size={20} />
                        )}
                        Min Length: 8
                      </li>
                      <li
                        className={`flex gap-1 items-center font-semibold ${isPasswordValid[1] ? "text-chart-1" : "text-red-500"}`}
                      >
                        {isPasswordValid[1] ? (
                          <Check size={20} />
                        ) : (
                          <X size={20} />
                        )}
                        One Uppercase Letter
                      </li>
                      <li
                        className={`flex gap-1 items-center font-semibold ${isPasswordValid[2] ? "text-chart-1" : "text-red-500"}`}
                      >
                        {isPasswordValid[2] ? (
                          <Check size={20} />
                        ) : (
                          <X size={20} />
                        )}
                        Atleast One Lowercase Letter
                      </li>
                      <li
                        className={`flex gap-1 items-center font-semibold ${isPasswordValid[3] ? "text-chart-1" : "text-red-500"}`}
                      >
                        {isPasswordValid[3] ? (
                          <Check size={20} />
                        ) : (
                          <X size={20} />
                        )}
                        Atleast One Digit
                      </li>
                      <li
                        className={`flex gap-1 items-center font-semibold ${isPasswordValid[4] ? "text-chart-1" : "text-red-500"}`}
                      >
                        {isPasswordValid[4] ? (
                          <Check size={20} />
                        ) : (
                          <X size={20} />
                        )}
                        Atleast One Special Character
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600">
                  Use a permanent email address where you can receive email.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="first_name"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        required
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        placeholder="John"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-chart-2 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="last_name"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        required
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Smith"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-chart-2 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-full">
                    <label
                      htmlFor="email"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        required
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="janesmith123@email.com"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-chart-2 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="country"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Country
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <select
                        required
                        id="country"
                        name="country"
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        autoComplete="country-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-chart-2 sm:text-sm/6"
                      >
                        <option value="">Select a country</option>
                        {countryList.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="currency"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Currency
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <input
                        required
                        id="currency"
                        type="text"
                        value={currencyDisplay}
                        readOnly // Keeps it clean since it auto-populates
                        placeholder="Currency format"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-chart-2 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Notifications
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600">
                  We'll always let you know about important changes, but you
                  pick what else you want to hear about.
                </p>

                <div className="mt-10 space-y-10">
                  <fieldset>
                    <legend className="text-sm/6 font-semibold text-gray-900">
                      By email
                    </legend>
                    <div className="mt-6 space-y-6">
                      <div className="flex gap-3">
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              defaultChecked
                              id="policy-changes"
                              name="policy-changes"
                              type="checkbox"
                              aria-describedby="policy-changes-description"
                              className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-chart-2 checked:bg-chart-2 indeterminate:border-chart-2 indeterminate:bg-chart-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                              onChange={() => {
                                setSelectedImpUpdates(!selectedImpUpdates);
                              }}
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-checked:opacity-100"
                              />
                              <path
                                d="M3 7H11"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-indeterminate:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm/6">
                          <label
                            htmlFor="policy-changes"
                            className="font-medium text-gray-900"
                          >
                            Important Updates
                          </label>
                          <p
                            id="policy-changes-description"
                            className="text-gray-500"
                          >
                            Get notified about policy and/or terms and
                            conditions changes.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              defaultChecked
                              id="monthly-updates"
                              name="monthly-updates"
                              type="checkbox"
                              aria-describedby="monthly-updates-description"
                              className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-chart-2 checked:bg-chart-2 indeterminate:border-chart-2 indeterminate:bg-chart-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                              onChange={() => {
                                setSelectedMonthlyUpdates(
                                  !selectedMonthlyUpdates,
                                );
                              }}
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-checked:opacity-100"
                              />
                              <path
                                d="M3 7H11"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-indeterminate:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm/6">
                          <label
                            htmlFor="candidates"
                            className="font-medium text-gray-900"
                          >
                            Monthly Updates
                          </label>
                          <p
                            id="candidates-description"
                            className="text-gray-500"
                          >
                            Get your monthly expenditure report.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              id="beta-tester"
                              name="beta-tester"
                              type="checkbox"
                              aria-describedby="beta-tester-description"
                              className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-chart-2 checked:bg-chart-2 indeterminate:border-chart-2 indeterminate:bg-chart-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                              onChange={() => {
                                setSelectedBetaTesting(!selectedBetaTesting);
                              }}
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-checked:opacity-100"
                              />
                              <path
                                d="M3 7H11"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-indeterminate:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm/6">
                          <label
                            htmlFor="beta-tester"
                            className="font-medium text-gray-900"
                          >
                            Beta Testing
                          </label>
                          <p
                            id="beta-tester-description"
                            className="text-gray-500"
                          >
                            Join our aplha/beta testing program, and support us
                            to launch new features.
                          </p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm/6 font-semibold text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-md bg-chart-2 px-3 py-2 text-sm font-semibold text-white shadow-xs ${!isPasswordValidChk || !arePassesSame ? "" : "hover:bg-chart-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart-2 active:bg-chart-1"}`}
                disabled={!isPasswordValidChk || !arePassesSame}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default RegistrationPage;
