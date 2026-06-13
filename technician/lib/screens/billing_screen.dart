import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/booking_model.dart';

class BillingScreen extends StatefulWidget {
  final BookingModel booking;
  const BillingScreen({Key? key, required this.booking}) : super(key: key);

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  final ApiService _apiService = ApiService();
  final List<Map<String, dynamic>> _selectedProducts = [];
  double _totalAmount = 0.0;
  bool _isSaving = false;

  // Catalog items representing your parts catalog in the Mongoose ecosystem
  final List<Map<String, dynamic>> _partsCatalog = [
    {
      'productId': 'prod-battery-car',
      'name': 'Erina 4-Wheeler Battery (Exide Gold)',
      'unitPrice': 4800.0,
      'gstRate': 0.28,
      'sku': 'BAT-EXD-4W',
    },
    {
      'productId': 'prod-battery-bike',
      'name': 'Erina 2-Wheeler Battery (Amaron Pro)',
      'unitPrice': 1950.0,
      'gstRate': 0.28,
      'sku': 'BAT-AMR-2W',
    },
    {
      'productId': 'prod-tyre-patch',
      'name': 'Tubeless Tyre Plugging Service & Cord',
      'unitPrice': 450.0,
      'gstRate': 0.18,
      'sku': 'TYR-PLG-CORD',
    },
    {
      'productId': 'prod-fuel-liter',
      'name': 'Emergency Fuel Topup (5 Litres)',
      'unitPrice': 650.0,
      'gstRate': 0.18,
      'sku': 'FUEL-TOPUP-5L',
    },
  ];

  @override
  void initState() {
    super.initState();
    // Load already sold products if any exist on the booking
    for (var p in widget.booking.soldProducts) {
      _selectedProducts.add({
        'productId': p.productId,
        'name': p.name,
        'unitPrice': p.unitPrice,
        'gstRate': p.gstRate,
        'sku': p.sku,
        'quantity': p.quantity,
      });
    }
    _calculateTotal();
  }

  void _addProduct(Map<String, dynamic> catalogItem) {
    setState(() {
      final index = _selectedProducts.indexWhere((p) => p['productId'] == catalogItem['productId']);
      if (index != -1) {
        _selectedProducts[index]['quantity'] += 1;
      } else {
        _selectedProducts.add({
          'productId': catalogItem['productId'],
          'name': catalogItem['name'],
          'unitPrice': catalogItem['unitPrice'],
          'gstRate': catalogItem['gstRate'],
          'sku': catalogItem['sku'],
          'quantity': 1,
        });
      }
      _calculateTotal();
    });
  }

  void _removeProduct(String productId) {
    setState(() {
      final index = _selectedProducts.indexWhere((p) => p['productId'] == productId);
      if (index != -1) {
        if (_selectedProducts[index]['quantity'] > 1) {
          _selectedProducts[index]['quantity'] -= 1;
        } else {
          _selectedProducts.removeAt(index);
        }
      }
      _calculateTotal();
    });
  }

  void _calculateTotal() {
    // Start with the default base service charge
    double total = widget.booking.paymentAmount; 
    
    // Add up the on-site parts sales
    for (var prod in _selectedProducts) {
      total += (prod['unitPrice'] as double) * (prod['quantity'] as int);
    }
    
    setState(() {
      _totalAmount = total;
    });
  }

  Future<void> _submitInvoiceUpdate() async {
    setState(() => _isSaving = true);
    
    final success = await _apiService.updateSoldItems(
      widget.booking.id,
      _selectedProducts,
      _totalAmount,
    );

    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('On-site parts catalog additions synced successfully.')),
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update invoice billing data.'),
            backgroundColor: Colors.redAccent,
          ),
        );
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'PARTS & BILLING',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 16),
        ),
        backgroundColor: Colors.black,
      ),
      body: _isSaving
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Catalog Header
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    'PARTS & SPARES CATALOG',
                    style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                  ),
                ),

                // Parts Catalog List
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: _partsCatalog.length,
                    itemBuilder: (context, index) {
                      final item = _partsCatalog[index];
                      return Card(
                        color: Colors.grey[900],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          title: Text(item['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text('₹${item['unitPrice']} (incl. ${item['gstRate'] * 100}% GST)', style: const TextStyle(color: Colors.amber, fontSize: 12)),
                          trailing: IconButton(
                            icon: const Icon(Icons.add_circle, color: Colors.amber, size: 28),
                            onPressed: () => _addProduct(item),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Divider(color: Colors.grey),
                ),

                // Cart Header
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Text(
                    'ITEMS ADDED FOR SERVICE CALL',
                    style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                  ),
                ),

                // Added Items Summary List
                Expanded(
                  child: _selectedProducts.isEmpty
                      ? const Center(child: Text('No custom parts added yet.', style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)))
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemCount: _selectedProducts.length,
                          itemBuilder: (context, index) {
                            final item = _selectedProducts[index];
                            final totalItemPrice = item['unitPrice'] * item['quantity'];
                            return Card(
                              color: const Color(0xFF0E0E0E),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(color: Colors.grey[900]!),
                              ),
                              child: ListTile(
                                title: Text(item['name'], style: const TextStyle(color: Colors.white, fontSize: 13)),
                                subtitle: Text('₹${item['unitPrice']} × ${item['quantity']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('₹$totalItemPrice', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                    const SizedBox(width: 8),
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent, size: 20),
                                      onPressed: () => _removeProduct(item['productId']),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),

                // Booking invoice footer summary card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0E0E0E),
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
                    border: Border.all(color: Colors.grey[900]!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Base Service Charge:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                          Text('₹${widget.booking.paymentAmount}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('TOTAL INVOICE AMOUNT:', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                          Text('₹$_totalAmount', style: const TextStyle(color: Colors.greenAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 15),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _submitInvoiceUpdate,
                        child: const Text(
                          'SAVE & CLOSE BILLING',
                          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
