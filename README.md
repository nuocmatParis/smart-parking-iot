# 🚗 Smart Parking System - IoT Project

Hệ thống quản lý bãi đỗ xe thông minh sử dụng Arduino, ESP8266 và công nghệ WebSocket để giám sát thời gian thực.

> **Đồ án môn học IoT - Đại học FPT**

## 🌟 Tính năng chính
* **Giám sát thời gian thực:** Hiển thị trạng thái 18 vị trí đỗ xe (Trống/Có xe) ngay lập tức trên Web Dashboard.
* **Cổng tự động:** Servo tự động đóng mở khi xe đến gần và còn chỗ trống.
* **Cập nhật siêu tốc:** Sử dụng giao thức WebSocket giúp độ trễ gần như bằng 0.

## 🛠️ Công nghệ sử dụng
* **Phần cứng:**
    * Arduino Uno (Xử lý cảm biến, điều khiển Servo).
    * ESP8266 - NodeMCU (Kết nối WiFi, gửi dữ liệu lên Server).
    * Cảm biến hồng ngoại (IR), Cảm biến siêu âm (Ultrasonic).
    * Servo Motors.
* **Phần mềm:**
    * **Backend:** Node.js, Express, WebSocket (`ws`).
    * **Frontend:** HTML, CSS, JavaScript.
    * **Giao tiếp:** Serial (Arduino <-> ESP), WebSocket (ESP <-> Web).

## 👥 Thành viên nhóm
* **[Hoàng Thị Khánh Linh]** - Leader
* **[Võ Đức Trí]**
* **[Nguyễn Đoàn Nhật Đăng]**
* **[Trần Phú Hưng]**
