

class mediaManager {


  ArrayList<imageData> imageStorage = new ArrayList<imageData>();
  ArrayList<soundData> soundStorage = new ArrayList<soundData>();


//-------------------------------------------------------------------------------


  mediaManager(PApplet pa) {
    imageStorage.add(new imageData("arrowIdle", loadImage("Images/arrowIdle.png")));
    imageStorage.add(new imageData("arrowLocked", loadImage("Images/arrowLocked.png")));
    imageStorage.add(new imageData("stop", loadImage("Images/stop.png")));
    imageStorage.add(new imageData("brush", loadImage("Images/brush.png")));

    soundStorage.add(new soundData("menuArrow", new SoundFile(pa, "Sound/SFX/click1.wav")));
    soundStorage.add(new soundData("startStop", new SoundFile(pa, "Sound/SFX/click2.wav")));
    soundStorage.add(new soundData("difficulty", new SoundFile(pa, "Sound/SFX/click3.wav")));
    soundStorage.add(new soundData("paint", new SoundFile(pa, "Sound/SFX/click4.wav")));
    soundStorage.add(new soundData("select", new SoundFile(pa, "Sound/SFX/click5.wav")));
    soundStorage.add(new soundData("time", new SoundFile(pa, "Sound/SFX/click6.wav")));
    soundStorage.add(new soundData("music1", new SoundFile(pa, "Sound/Music/music1.wav")));
  }


//-------------------------------------------------------------------------------


  PImage getImage(String name_) {
    for (int i = 0; i < imageStorage.size(); i++) {
      if (imageStorage.get(i).name == name_) {
        if (imageStorage.get(i).img != null) {
          return imageStorage.get(i).img;
        } else {
          print("No image data");
        }
      }
    }
    print("No image found");
    return null;
  }


//----------------------------------------


  SoundFile getSound(String name_) {
    for (int i = 0; i < soundStorage.size(); i++) {
      if (soundStorage.get(i).name == name_) {
        if (soundStorage.get(i).sound != null) {
          return soundStorage.get(i).sound;
        } else {
          print("No sound data");
        }
      }
    }
    print("No sound found");
    return null;
  }
}


//-------------------------------------------------------------------------------


class imageData {


  String name;
  PImage img;


//-------------------------------------------------------------------------------


  imageData(String name_, PImage img_) {
    name = name_;
    img = img_;
  }
}


//-------------------------------------------------------------------------------


class soundData {


  String name;
  SoundFile sound;


//-------------------------------------------------------------------------------


  soundData(String name_, SoundFile sound_) {
    name = name_;
    sound = sound_;
  }
}


//-------------------------------------------------------------------------------
