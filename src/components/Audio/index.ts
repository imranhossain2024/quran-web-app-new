/**
 * Audio Components Export Index
 * 
 * এই ফাইলটি Audio কম্পোনেন্টগুলোর জন্য একটি সেন্ট্রাল এক্সপোর্ট পয়েন্ট।
 * এটি ব্যবহার করে সহজেই বিভিন্ন অডিও কম্পোনেন্ট ইম্পোর্ট করা যায়।
 * 
 * @example
 * import { AudioPlayerCard, AudioProvider, useAudio } from "@/components/Audio";
 */

// Main audio player card component
export { default as AudioPlayerCard } from "./AudioPlayerCard";
export type { AudioPlayerCardProps } from "./AudioPlayerCard";

// Audio provider and context
export { AudioProvider, useAudio } from "./AudioProvider";

// Full-screen audio player
export { default as AudioPlayer } from "./AudioPlayer";

// Mini audio player
export { default as MiniAudioPlayer } from "./MiniAudioPlayer";