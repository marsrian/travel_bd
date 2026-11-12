export default function LanguageText({
  value,
  language = "en",
  fallback = "Information not available",
}) {
  const text =
    typeof value === "string"
      ? value
      : value?.[language] || value?.en || value?.bn;

  return <>{text || fallback}</>;
}