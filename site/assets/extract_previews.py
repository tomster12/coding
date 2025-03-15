import os
import subprocess

# Input and output folder paths
input_folder = "gifs"
output_folder = "previews"

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Loop through GIFs in the input folder
for filename in os.listdir(input_folder):
    if filename.lower().endswith(".gif"):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, os.path.splitext(filename)[0] + ".jpg")

        # Extract the first frame using FFmpeg
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, 
            "-vf", "select=eq(n\\,0)", 
            "-vsync", "vfr", output_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Done! First frames saved in '" + output_folder + "'")
