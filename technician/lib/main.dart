import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const TechnicianMobileApp());
}

class TechnicianMobileApp extends StatelessWidget {
  const TechnicianMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Erina Technician Console',
      debugShowCheckedModeBanner: false,
      
      // Curated dark theme system aligning with modern premium design specs
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.amber,
        scaffoldBackgroundColor: Colors.black,
        
        // Custom text theme using clean, premium sizing configurations
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold, color: Colors.white),
          titleLarge: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: Colors.white),
          bodyLarge: TextStyle(fontSize: 14.0, color: Colors.white70),
          bodyMedium: TextStyle(fontSize: 12.0, color: Colors.grey),
        ),

        // Custom Card theme
        cardTheme: CardTheme(
          color: Colors.grey[900],
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        ),

        // Custom Dialog theme
        dialogTheme: DialogTheme(
          backgroundColor: const Color(0xFF0F0F0F),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        ),

        // Input decoration theme
        inputDecorationTheme: InputDecorationTheme(
          fillColor: Colors.grey[900]?.withOpacity(0.5),
          filled: true,
          labelStyle: const TextStyle(color: Colors.grey),
          hintStyle: const TextStyle(color: Colors.grey),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[800]!),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[800]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.amber),
          ),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
