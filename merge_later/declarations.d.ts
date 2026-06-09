declare module 'htm' {
  const htm: any;
  export default htm;
}
declare module 'media-data' {
  export const MISC_ART: string[];
  export const MISC_MEDIA: string[];
  export const AUDIO_TRACKS: Array<{
    name: string;
    folder: string;
    title: string;
  }>;
}
