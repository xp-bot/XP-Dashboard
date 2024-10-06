export default async (blob: Blob, fileName: string, mimeType = "text/csv") => {
  if (!(blob instanceof Blob)) {
    blob = new Blob([blob], { type: mimeType });
  }

  const a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  document.body.appendChild(a); // Append to the body to make it part of the DOM
  a.click();
  document.body.removeChild(a); // Remove from the DOM after clicking
};
