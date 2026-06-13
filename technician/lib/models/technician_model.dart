class TechnicianModel {
  final String id;
  final String technicianId;
  final String name;
  final String phone;
  final String availability;
  final String? currentJob;
  final double rating;
  final String serviceArea;
  final String vehicleType;

  TechnicianModel({
    required this.id,
    required this.technicianId,
    required this.name,
    required this.phone,
    required this.availability,
    this.currentJob,
    required this.rating,
    required this.serviceArea,
    required this.vehicleType,
  });

  factory TechnicianModel.fromJson(Map<String, dynamic> json) {
    return TechnicianModel(
      id: json['_id'] ?? '',
      technicianId: json['technicianId'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      availability: json['availability'] ?? 'offline',
      currentJob: json['currentJob'],
      rating: (json['rating'] ?? 5.0) is int 
          ? (json['rating'] as int).toDouble() 
          : (json['rating'] ?? 5.0) as double,
      serviceArea: json['serviceArea'] ?? '',
      vehicleType: json['vehicleType'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'technicianId': technicianId,
      'name': name,
      'phone': phone,
      'availability': availability,
      'currentJob': currentJob,
      'rating': rating,
      'serviceArea': serviceArea,
      'vehicleType': vehicleType,
    };
  }
}
