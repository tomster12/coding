

ArrayList<notification> notifications = new ArrayList<notification>();



class notification {


  PVector pos;
  String text;
  int time;


  notification(PVector pos_, String text_, int time_) {
    pos = pos_;
    text = text_;
    time = time_;
  }


  void update() {
    if (time <= 0) {
      removeNotification(this);
    } else {
      pos.add(new PVector(0, -0.5));
      time -= 0.5;
      noStroke();
      fill(0);
      text(text, pos.x, pos.y);
    }
  }
}


void addNotification(PVector pos_, String text_, int time_) {
  notifications.add(new notification(pos_, text_, time_));
}


void removeNotification(notification not_) {
  for (int i = 0; i < notifications.size(); i++) {
    if (notifications.get(i) == not_) {
      notifications.remove(i);
      break;
    }
  }
}


void updateNotifications() {
  for (int i = 0; i < notifications.size(); i++) {
    notifications.get(i).update();
  }
}
