// Import ROS Library from ROS Web Tools
var ros = new ROSLIB.Ros({
  url: "ws://localhost:9090"
});

// Test ROS Connection
ros.on("connection", function() {
  document.getElementById("status").innerHTML =
    "<span style='color: green;'>Connected</span>";
});

ros.on("error", function(error) {
  document.getElementById("status").innerHTML =
    "<span style='color: red;'>Error</span>";
});

ros.on("close", function() {
  document.getElementById("status").innerHTML =
    "<span style='color: gray;'>Closed</span>";
});

// Listening to a ROS topic
var txt_listener = new ROSLIB.Topic({
  ros: ros,
  name: "/txt_msg",
  messageType: "std_msgs/String"
});

/* txt_listener.subscribe(function(m) {
    document.getElementById("msg").innerHTML = m.data;
}); */

// Publish a ROS Topic
cmd_vel_listener = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd_vel",
  messageType: "geometry_msgs/Twist"
});

move = function(linear, angular) {
  var twist = new ROSLIB.Message({
    linear: {
      x: linear,
      y: 0,
      z: 0
    },
    angular: {
      x: 0,
      y: 0,
      z: angular
    }
  });
  cmd_vel_listener.publish(twist);
};

// Create joy stick
createJoystick = function() {
  var options = {
    zone: document.getElementById("zone_joystick"),
    threshold: 0.1,
    position: { left: 50 + "%" },
    mode: "static",
    size: 150,
    color: "#000000"
  };
  manager = nipplejs.create(options);

  linear_speed = 0;
  angular_speed = 0;

  // On movement
  self.manager.on("start", function(event, nipple) {
    console.log("Movement start");
  });

  // During movement
  self.manager.on("move", function(event, nipple) {
    console.log("Moving");
  });

  // Ending movement
  self.manager.on("end", function() {
    console.log("Movement end");
  });

  // On movement start call move function
  manager.on("start", function(event, nipple) {
    timer = setInterval(function() {
      move(linear_speed, angular_speed);
    }, 25);
  });

  // On movement end
  manager.on("end", function() {
    if (timer) {
      clearInterval(timer);
    }
    self.move(0, 0);
  });

  // During movement
  manager.on("move", function(event, nipple) {
    max_linear = 5.0; // m/s
    max_angular = 2.0; // rad/s
    max_distance = 75.0; // pixels;
    linear_speed =
      (Math.sin(nipple.angle.radian) * max_linear * nipple.distance) /
      max_distance;
    angular_speed =
      (-Math.cos(nipple.angle.radian) * max_angular * nipple.distance) /
      max_distance;
  });
};

window.onload = function() {
  createJoystick();
};
