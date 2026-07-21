import { Clapperboard, Pencil, Pizza, ShoppingBasket } from "lucide-react";
// import Profile from "./profile.svg";
import Feature1 from "./feature_1.jpeg";
import Feature2 from "./feature_2.jpeg";
import Feature3 from "./feature_3.jpeg";
import android_htu_1 from "./android_htu_1.jpg";
import android_htu_2 from "./android_htu_2.jpg";
import android_htu_3 from "./android_htu_3.jpg";
import android_how_to_use_1 from "./android_how_to_use_1.jpg";
import android_how_to_use_2 from "./android_how_to_use_2.jpg";
import android_how_to_use_3 from "./android_how_to_use_3.jpg";
import android_how_to_use_4 from "./android_how_to_use_4.jpg";
import android_how_to_use_5 from "./android_how_to_use_5.jpg";
export const assets = {
  // Profile,
  Feature1,
  Feature2,
  Feature3,
  android_htu_1,
  android_htu_2,
  android_htu_3,
  android_how_to_use_1,
  android_how_to_use_2,
  android_how_to_use_3,
  android_how_to_use_4,
  android_how_to_use_5,
};

export function formatMoney(value, currency = "₹") {
  const abs = Math.abs(value);
  return `${currency}${abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

const root = document.documentElement;
let cl = [];
for (let index = 0; index < 7; index++) {
  const computedColor = getComputedStyle(root)
    .getPropertyValue(`--chart-${index + 1}`)
    .trim();
  cl.push(computedColor);
}

export const colorList = cl;

let clmap = {};
const cat = ["Food", "Grocery", "Entertainment", "Stationery", "Other"];
for (let index = 0; index < 5; index++) {
  const computedColor = getComputedStyle(root)
    .getPropertyValue(`--chart-${index + 1}`)
    .trim();
  clmap[cat[index]] = computedColor;
}
export const colorMap = clmap;

export const date = new Date();

function weekListFunc() {
  const miliInOneDay = 24 * 60 * 60 * 1000;
  const miliInOneWeek = miliInOneDay * 6;
  const today = new Date();
  const list = [];
  // setting to nearest monday
  today.setTime(today.valueOf() + (7 - today.getDay() + 1) * miliInOneDay);
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 9; i++) {
    let tl = [];
    today.setTime(today.valueOf() - miliInOneDay);
    tl.push(
      today.toLocaleString("en-uk", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      }),
    );
    today.setTime(today.valueOf() - miliInOneWeek);
    tl.push(
      today.toLocaleString("en-uk", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      }),
    );
    list.push(tl);
  }
  return list;
}

export const weekList = weekListFunc();
