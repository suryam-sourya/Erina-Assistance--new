import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/booking_model.dart';
import '../models/technician_model.dart';

class ApiService {
  // Dynamically target correct host depending on runtime platform (Web vs Android Emulator)
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3001/api';
    } else {
      // Direct connection to your Mac's Wi-Fi IP (works on both physical devices and emulators)
      return 'http://192.168.1.100:3001/api';
    }
  }

  // 1. Get Technician info
  Future<TechnicianModel?> getTechnician(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/technicians/$id'));
      if (response.statusCode == 200) {
        return TechnicianModel.fromJson(json.decode(response.body));
      }
    } catch (e) {
      print('ApiService.getTechnician error: $e');
    }
    return null;
  }

  // 2. Patch Technician Availability Status (uses PATCH)
  Future<bool> updateAvailability(String id, String availability, {bool clearJob = false}) async {
    return updateTechnician(id, {
      'availability': availability.toLowerCase(),
      if (clearJob) 'currentJob': null,
    });
  }

  // 3. Fetch Booking Details (uses GET)
  Future<BookingModel?> getBookingDetails(String bookingId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bookings/$bookingId'));
      if (response.statusCode == 200) {
        return BookingModel.fromJson(json.decode(response.body));
      }
    } catch (e) {
      print('ApiService.getBookingDetails error: $e');
    }
    return null;
  }

  // 4. Update Booking Status / Substatus (uses PUT based on Next.js backend configuration)
  Future<bool> updateBookingStatus(String bookingId, String status, {String? subStatus}) async {
    try {
      final payload = {
        'status': status.toUpperCase(),
        if (subStatus != null) 'subStatus': subStatus.toUpperCase(),
      };

      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('ApiService.updateBookingStatus error: $e');
      return false;
    }
  }

  // 5. Add Sold Products/Services to Booking & Finalize Invoice Amount (uses PUT)
  Future<bool> updateSoldItems(
    String bookingId, 
    List<Map<String, dynamic>> soldProducts, 
    double totalAmount
  ) async {
    try {
      final payload = {
        'soldProducts': soldProducts,
        'paymentAmount': totalAmount,
      };

      final response = await http.put(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('ApiService.updateSoldItems error: $e');
      return false;
    }
  }

  // 6. Update Technician Profile (uses PATCH)
  Future<bool> updateTechnician(String id, Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/technicians/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('ApiService.updateTechnician error: $e');
      return false;
    }
  }

  // 7. Fetch Completed Bookings for Technician
  Future<List<BookingModel>> getCompletedBookingsForTechnician(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bookings'));
      if (response.statusCode == 200) {
        final List<dynamic> list = json.decode(response.body);
        return list
            .map((item) => BookingModel.fromJson(item as Map<String, dynamic>))
            .where((b) => b.status.toUpperCase() == 'COMPLETED' && b.technicianId == id)
            .toList();
      }
    } catch (e) {
      print('ApiService.getCompletedBookingsForTechnician error: $e');
    }
    return [];
  }
}
