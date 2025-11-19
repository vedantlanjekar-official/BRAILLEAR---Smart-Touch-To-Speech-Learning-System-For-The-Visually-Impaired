import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TouchIcon, 
  Volume2, 
  Zap, 
  Heart, 
  Accessibility, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';

export default function Landing() {
  const features = [
    {
      icon: <TouchIcon className="h-6 w-6" />,
      title: "Touch-Based Learning",
      description: "TTP223 capacitive sensors mapped to A-Z and 0-9 for precise tactile interaction"
    },
    {
      icon: <Volume2 className="h-6 w-6" />,
      title: "Real-Time Audio Feedback",
      description: "Immediate phonetic playback with <200ms latency for natural learning flow"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Raspberry Pi Powered",
      description: "RP2040 dual-core processor ensures reliable sensor management and UART communication"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Affordable & Accessible",
      description: "Cost-effective design under ₹2,000 makes inclusive education economically viable"
    },
    {
      icon: <Accessibility className="h-6 w-6" />,
      title: "Human-Centered Design",
      description: "Ergonomic layout following Braille spatial mapping principles for comfort and familiarity"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Portable & Wireless",
      description: "Rechargeable battery with Type-C charging enables mobile usage across environments"
    }
  ];

  const benefits = [
    "Enhanced multisensory learning through tactile and auditory stimuli",
    "Accelerated Braille literacy development with real-time feedback",
    "Promotes inclusive education under UN SDG Goal 4",
    "Open-source framework encourages community-driven innovation",
    "Modular architecture allows future expansion and customization"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Smart Touch-to-Speech Learning System
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
            BRAILLEAR
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing Braille education through embedded systems and real-time audio feedback. 
            Empowering visually impaired learners with affordable, accessible technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg">
              <Link to="/login">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="px-8 py-3 rounded-2xl border-2">
              <Link to="/contact">
                Learn More
              </Link>
            </Button>
          </div>

          {/* Problem Statement */}
          <Card className="max-w-4xl mx-auto mb-16 shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Addressing Critical Educational Barriers</CardTitle>
              <CardDescription className="text-lg text-slate-600">
                Visually impaired individuals face persistent challenges accessing effective, affordable, and interactive Braille learning tools
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Current Challenges:</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Expensive, region-specific learning systems</li>
                    <li>• Lack of real-time audio feedback</li>
                    <li>• Bulky, non-portable devices</li>
                    <li>• High maintenance complexity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Our Solution:</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Embedded touch-based learning platform</li>
                    <li>• Real-time tactile-to-audio synchronization</li>
                    <li>• Portable, rechargeable design</li>
                    <li>• Open-source, community-driven development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">How BRAILLEAR Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A seamless integration of capacitive touch sensing and embedded auditory feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TouchIcon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Touch Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  TTP223 capacitive sensors detect user touch on alphanumeric characters (A-Z, 0-9) 
                  through GPIO interrupts on Raspberry Pi Pico
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Signal Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Microcontroller processes input signals and transmits character data via 
                  UART serial communication to host computer
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Audio Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Python-based audio mapping algorithm using PyDub library generates 
                  real-time phonetic output for multisensory learning
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Key Features & USP</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Combining affordability, accessibility, and cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-slate-800">Impact & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Braille Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in making inclusive education accessible to millions of visually impaired learners worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="px-8 py-3 rounded-2xl">
              <Link to="/login">
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="!bg-transparent !border-white !text-white hover:!bg-white hover:!text-blue-600 px-8 py-3 rounded-2xl">
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl">BRAILLEAR</span>
          </div>
          <p className="text-slate-400 mb-4">
            Smart Touch-to-Speech Learning System for the Visually Impaired
          </p>
          <p className="text-sm text-slate-500">
            © 2024 Team Cubic Vision. Open-source project promoting inclusive education.
          </p>
        </div>
      </footer>
    </div>
  );
}