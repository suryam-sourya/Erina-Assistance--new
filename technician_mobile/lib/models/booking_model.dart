class BookingModel {
  final String id;
  final String ticketId;
  final String status;
  final String? subStatus;
  final double paymentAmount;
  final String description;
  
  // Nested Customer
  final String customerName;
  final String phone;

  // Nested Vehicle
  final String vehicleType;
  final String vehiclePlate;

  // Nested Location
  final String addressString;
  final List<double> coordinates; // [longitude, latitude]

  // Sold Items List
  final List<SoldProductModel> soldProducts;
  final String? technicianId;

  BookingModel({
    required this.id,
    required this.ticketId,
    required this.status,
    this.subStatus,
    required this.paymentAmount,
    required this.description,
    required this.customerName,
    required this.phone,
    required this.vehicleType,
    required this.vehiclePlate,
    required this.addressString,
    required this.coordinates,
    required this.soldProducts,
    this.technicianId,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    // Customer parsing
    final customerObj = json['customer'] as Map<String, dynamic>?;
    final cName = customerObj?['name'] ?? json['customerName'] ?? '';
    final cPhone = customerObj?['phone'] ?? json['phone'] ?? '';

    // Vehicle parsing
    final vehicleObj = json['vehicle'] as Map<String, dynamic>?;
    final vType = vehicleObj?['type'] ?? json['vehicleType'] ?? '';
    final vPlate = vehicleObj?['plateNumber'] ?? json['vehiclePlate'] ?? json['vehicleNumber'] ?? '';

    // Location parsing
    String addr = '';
    if (json['location'] is Map) {
      final locationMap = json['location'] as Map<String, dynamic>;
      addr = locationMap['address'] ?? json['addressString'] ?? json['address'] ?? '';
    } else if (json['location'] is String) {
      addr = json['location'] as String;
    } else {
      addr = json['addressString'] ?? json['address'] ?? '';
    }

    // Coordinates parsing
    List<double> coordsList = [77.7602, 12.9902]; // Default: [lng, lat]
    if (json['coordinates'] is Map) {
      final coordsMap = json['coordinates'] as Map<String, dynamic>;
      final latVal = coordsMap['lat'] ?? coordsMap['latitude'];
      final lngVal = coordsMap['lng'] ?? coordsMap['longitude'];
      if (latVal != null && lngVal != null) {
        coordsList = [(lngVal as num).toDouble(), (latVal as num).toDouble()];
      }
    } else if (json['location'] is Map) {
      final locationMap = json['location'] as Map<String, dynamic>;
      if (locationMap['coordinates'] is List) {
        coordsList = (locationMap['coordinates'] as List<dynamic>)
            .map((e) => (e as num).toDouble())
            .toList();
      }
    }

    // Products parsing
    final productsList = (json['soldProducts'] as List<dynamic>?)
            ?.map((e) => SoldProductModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return BookingModel(
      id: json['_id'] ?? '',
      ticketId: json['ticketId'] ?? '',
      status: json['status'] ?? 'PENDING',
      subStatus: json['subStatus'],
      paymentAmount: (json['paymentAmount'] ?? 0.0) is int
          ? (json['paymentAmount'] as int).toDouble()
          : (json['paymentAmount'] ?? 0.0) as double,
      description: json['description'] ?? '',
      customerName: cName,
      phone: cPhone,
      vehicleType: vType,
      vehiclePlate: vPlate,
      addressString: addr,
      coordinates: coordsList,
      soldProducts: productsList,
      technicianId: json['technicianId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'ticketId': ticketId,
      'status': status,
      'subStatus': subStatus,
      'paymentAmount': paymentAmount,
      'description': description,
      'customer': {
        'name': customerName,
        'phone': phone,
      },
      'vehicle': {
        'type': vehicleType,
        'plateNumber': vehiclePlate,
      },
      'location': {
        'type': 'Point',
        'address': addressString,
        'coordinates': coordinates,
      },
      'soldProducts': soldProducts.map((e) => e.toJson()).toList(),
      'technicianId': technicianId,
    };
  }
}

class SoldProductModel {
  final String productId;
  final String name;
  final String sku;
  final double unitPrice;
  final int quantity;
  final double gstRate;

  SoldProductModel({
    required this.productId,
    required this.name,
    required this.sku,
    required this.unitPrice,
    required this.quantity,
    required this.gstRate,
  });

  factory SoldProductModel.fromJson(Map<String, dynamic> json) {
    return SoldProductModel(
      productId: json['productId'] ?? '',
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      unitPrice: (json['unitPrice'] ?? 0.0) is int
          ? (json['unitPrice'] as int).toDouble()
          : (json['unitPrice'] ?? 0.0) as double,
      quantity: json['quantity'] ?? 1,
      gstRate: (json['gstRate'] ?? 0.28) is int
          ? (json['gstRate'] as int).toDouble()
          : (json['gstRate'] ?? 0.28) as double,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'name': name,
      'sku': sku,
      'unitPrice': unitPrice,
      'quantity': quantity,
      'gstRate': gstRate,
    };
  }
}
