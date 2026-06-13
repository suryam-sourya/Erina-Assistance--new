import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/technician_model.dart';
import '../models/booking_model.dart';
import 'job_detail_screen.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  final String technicianId;
  const DashboardScreen({Key? key, required this.technicianId}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  TechnicianModel? _technician;
  Timer? _pollingTimer;
  bool _isLoading = true;
  double _totalEarnings = 0.0;
  int _completedJobsCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchStatus();
    // Low-overhead background check every 8 seconds (matching customer's poll interval)
    _pollingTimer = Timer.periodic(const Duration(seconds: 8), (timer) => _fetchStatus());
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchStatus() async {
    final tech = await _apiService.getTechnician(widget.technicianId);
    if (tech != null) {
      final completedBookings = await _apiService.getCompletedBookingsForTechnician(widget.technicianId);
      double earnings = 0.0;
      for (var b in completedBookings) {
        earnings += b.paymentAmount;
      }

      if (mounted) {
        setState(() {
          _technician = tech;
          _totalEarnings = earnings;
          _completedJobsCount = completedBookings.length;
          _isLoading = false;
        });

        // Auto-navigate to Active Job Screen if assigned
        if (tech.currentJob != null && tech.currentJob!.isNotEmpty) {
          _pollingTimer?.cancel(); // Pause background querying while executing job
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => JobDetailScreen(
                bookingId: tech.currentJob!,
                technicianId: widget.technicianId,
              ),
            ),
          ).then((_) {
            // Resume querying when returning
            _fetchStatus();
            _pollingTimer = Timer.periodic(const Duration(seconds: 8), (timer) => _fetchStatus());
          });
        }
      }
    }
  }

  Future<void> _toggleAvailability(String newStatus) async {
    setState(() => _isLoading = true);
    final success = await _apiService.updateAvailability(widget.technicianId, newStatus);
    if (success) {
      _fetchStatus();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Availability update failed. Please check network connection.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      setState(() => _isLoading = false);
    }
  }

  void _showSettingsDialog() {
    if (_technician == null) return;
    
    final nameController = TextEditingController(text: _technician!.name);
    final phoneController = TextEditingController(text: _technician!.phone);
    final serviceAreaController = TextEditingController(text: _technician!.serviceArea);
    String selectedVehicle = _technician!.vehicleType;

    final vehicleCategories = [
      'Flatbed Tow Truck',
      'Heavy Duty Tow & Battery Rig',
      'EV Mobile Charger Van',
      'Battery Jumpstart & Fuel Van',
      'RSA Response Bike & Lockout Toolset',
    ];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text(
                'PROFILE SETTINGS',
                style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 16, color: Colors.amber),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Operator Name', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    ),
                    const SizedBox(height: 15),
                    const Text('Contact Phone', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: phoneController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    ),
                    const SizedBox(height: 15),
                    const Text('Active Service Area', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: serviceAreaController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    ),
                    const SizedBox(height: 15),
                    const Text('Vehicle Category', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: vehicleCategories.contains(selectedVehicle) ? selectedVehicle : vehicleCategories.first,
                      dropdownColor: const Color(0xFF0F0F0F),
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                      items: vehicleCategories.map((type) {
                        return DropdownMenuItem<String>(
                          value: type,
                          child: Text(type),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            selectedVehicle = val;
                          });
                        }
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
                  onPressed: () async {
                    final newName = nameController.text.trim();
                    final newPhone = phoneController.text.trim();
                    final newArea = serviceAreaController.text.trim();
                    
                    if (newName.isEmpty || newPhone.isEmpty || newArea.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill all fields'), backgroundColor: Colors.redAccent),
                      );
                      return;
                    }

                    Navigator.pop(context);
                    setState(() => _isLoading = true);

                    final success = await _apiService.updateTechnician(widget.technicianId, {
                      'name': newName,
                      'phone': newPhone,
                      'serviceArea': newArea,
                      'vehicleType': selectedVehicle,
                    });

                    if (success) {
                      _fetchStatus();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Profile settings updated successfully'), backgroundColor: Colors.green),
                      );
                    } else {
                      setState(() => _isLoading = false);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Failed to update profile settings'), backgroundColor: Colors.redAccent),
                      );
                    }
                  },
                  child: const Text('SAVE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.amber)),
      );
    }

    final Map<String, Color> statusColors = {
      'available': Colors.greenAccent,
      'busy': Colors.orangeAccent,
      'offline': Colors.grey,
    };

    final activeStatusColor = statusColors[_technician?.availability] ?? Colors.grey;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'DASHBOARD',
          style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.w900, color: Colors.white, fontSize: 16),
        ),
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.amber),
            onPressed: _showSettingsDialog,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Premium Profile Frame
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.grey[900]!, Colors.black],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(color: Colors.grey[800]!, width: 1.5),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 35,
                    backgroundColor: activeStatusColor.withOpacity(0.1),
                    child: Icon(Icons.engineering, size: 40, color: activeStatusColor),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    _technician?.name ?? 'User Name',
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'ID: ${_technician?.technicianId}',
                    style: const TextStyle(color: Colors.grey, fontSize: 13, letterSpacing: 1),
                  ),
                  const SizedBox(height: 15),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: activeStatusColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _technician?.availability.toUpperCase() ?? 'OFFLINE',
                        style: TextStyle(color: activeStatusColor, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 25),

            // Vehicle & Service Specs Info Row
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[900]?.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[800]!),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.directions_car, color: Colors.amber),
                        const SizedBox(height: 6),
                        const Text('VEHICLE TYPE', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          _technician?.vehicleType ?? 'UNKNOWN',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          textAlign: TextAlign.center,
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[900]?.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[800]!),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.star, color: Colors.amber),
                        const SizedBox(height: 6),
                        const Text('AVERAGE RATING', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          '${_technician?.rating ?? 5.0} / 5.0',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[900]?.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[800]!),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.currency_rupee, color: Colors.greenAccent),
                        const SizedBox(height: 6),
                        const Text('TOTAL EARNINGS', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          '₹${_totalEarnings.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 16),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[900]?.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.grey[800]!),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.check_circle_outline, color: Colors.blueAccent),
                        const SizedBox(height: 6),
                        const Text('COMPLETED JOBS', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          '$_completedJobsCount Jobs',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),

            // Controls Headline
            const Text(
              'MANAGEMENT CONTROLS',
              style: TextStyle(color: Colors.grey, letterSpacing: 1.5, fontSize: 11, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),

            // Control Buttons
            ElevatedButton.icon(
              icon: const Icon(Icons.check_circle_outline, color: Colors.black),
              label: const Text('GO AVAILABLE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent[700],
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              onPressed: () => _toggleAvailability('available'),
            ),
            const SizedBox(height: 15),
            ElevatedButton.icon(
              icon: const Icon(Icons.power_settings_new, color: Colors.white),
              label: const Text('GO OFFLINE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[900],
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                side: BorderSide(color: Colors.grey[800]!),
              ),
              onPressed: () => _toggleAvailability('offline'),
            ),
            const Spacer(),

            // Listening status message
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.grey),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _technician?.availability == 'available' 
                        ? 'Monitoring live dispatch queue...' 
                        : 'Go online to receive jobs.',
                    style: const TextStyle(color: Colors.grey, fontSize: 13, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}
