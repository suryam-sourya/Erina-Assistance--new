import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../models/booking_model.dart';
import 'billing_screen.dart';

class JobDetailScreen extends StatefulWidget {
  final String bookingId;
  final String technicianId;
  const JobDetailScreen({Key? key, required this.bookingId, required this.technicianId}) : super(key: key);

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final ApiService _apiService = ApiService();
  BookingModel? _booking;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBooking();
  }

  Future<void> _loadBooking() async {
    final booking = await _apiService.getBookingDetails(widget.bookingId);
    if (mounted) {
      setState(() {
        _booking = booking;
        _isLoading = false;
      });
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  Future<void> _sendWhatsApp(String phoneNumber, String ticketId) async {
    final sanitizedNumber = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final url = Uri.parse('https://wa.me/$sanitizedNumber?text=Hello%2C%20this%20is%20your%20Erina%20RSA%20Technician%20regarding%20ticket%20$ticketId.');
    await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  Future<void> _launchNavigation(double lat, double lng) async {
    final googleMapsUrl = Uri.parse('google.navigation:q=$lat,$lng&mode=d');
    final appleMapsUrl = Uri.parse('http://maps.apple.com/?daddr=$lat,$lng');

    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl);
    } else if (await canLaunchUrl(appleMapsUrl)) {
      await launchUrl(appleMapsUrl);
    } else {
      final webUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
      await launchUrl(webUrl, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _updateStatus(String newStatus, {String? subStatus}) async {
    setState(() => _isLoading = true);
    final success = await _apiService.updateBookingStatus(widget.bookingId, newStatus, subStatus: subStatus);
    if (success) {
      await _loadBooking();
      if (newStatus.toUpperCase() == 'COMPLETED') {
        // Automatically release technician
        await _apiService.updateAvailability(widget.technicianId, 'available', clearJob: true);
        if (mounted) {
          Navigator.pop(context);
        }
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update job status. Check your network.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.amber)),
      );
    }

    if (_booking == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(backgroundColor: Colors.black),
        body: const Center(
          child: Text('Error loading booking data.', style: TextStyle(color: Colors.white)),
        ),
      );
    }

    final coords = _booking!.coordinates;
    final lat = coords.length >= 2 ? coords[1] : 12.9902;
    final lng = coords.isNotEmpty ? coords[0] : 77.7602;

    final jobStatus = _booking!.status.toUpperCase();
    final jobSubStatus = _booking!.subStatus?.toUpperCase() ?? '';

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'TICKET: ${_booking!.ticketId}',
          style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 16),
        ),
        backgroundColor: Colors.amber[800],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Banner Card
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.amber[800]?.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber[800]!.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('CURRENT STATUS', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text(
                    jobSubStatus.isNotEmpty ? '$jobStatus ($jobSubStatus)' : jobStatus,
                    style: TextStyle(color: Colors.amber[400], fontWeight: FontWeight.bold, fontSize: 13),
                  )
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Customer Details Card
            Card(
              color: Colors.grey[900],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _booking!.customerName,
                          style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        // Quick contact buttons
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.phone, color: Colors.greenAccent),
                              onPressed: () => _makePhoneCall(_booking!.phone),
                            ),
                            IconButton(
                              icon: const Icon(Icons.message, color: Colors.blueAccent),
                              onPressed: () => _sendWhatsApp(_booking!.phone, _booking!.ticketId),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Divider(color: Colors.grey),
                    const SizedBox(height: 10),
                    _detailRow(Icons.directions_car, 'VEHICLE', '${_booking!.vehicleType} [${_booking!.vehiclePlate}]'),
                    const SizedBox(height: 12),
                    _detailRow(Icons.location_on, 'ADDRESS', _booking!.addressString),
                    const SizedBox(height: 12),
                    _detailRow(Icons.description, 'DETAILS', _booking!.description.isNotEmpty ? _booking!.description : 'No descriptive text provided.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Navigation Button
            ElevatedButton.icon(
              icon: const Icon(Icons.navigation, color: Colors.black),
              label: const Text('LAUNCH NAVIGATION MAPS', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent[700],
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              onPressed: () => _launchNavigation(lat, lng),
            ),
            const SizedBox(height: 25),

            const Text(
              'DISPATCH ACTIONS',
              style: TextStyle(color: Colors.grey, letterSpacing: 1.5, fontSize: 11, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 15),

            // Dynamic Step Transitions
            if (jobStatus == 'ASSIGNED') ...[
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber[800],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                ),
                onPressed: () => _updateStatus('IN_PROGRESS', subStatus: 'LEAVING_HUB'),
                child: const Text('DISPATCH: LEAVE FOR LOCATION', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white)),
              ),
            ] else if (jobStatus == 'IN_PROGRESS' && jobSubStatus == 'LEAVING_HUB') ...[
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple[800],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                ),
                onPressed: () => _updateStatus('IN_PROGRESS', subStatus: 'ARRIVED'),
                child: const Text('DISPATCH: I HAVE ARRIVED', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white)),
              ),
            ] else if (jobStatus == 'IN_PROGRESS' && jobSubStatus == 'ARRIVED') ...[
              ElevatedButton.icon(
                icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                label: const Text('ON-SITE PARTS SALE / BILLING', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[800],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => BillingScreen(booking: _booking!)),
                  ).then((_) => _loadBooking());
                },
              ),
              const SizedBox(height: 15),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green[800],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                ),
                onPressed: () => _updateStatus('COMPLETED'),
                child: const Text('DISPATCH: SERVICE COMPLETED', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white)),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.amber, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
