'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Typography } from '@/components/ui/typography';
import { HeroSection } from '@/components/hero-section';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { DecorativeFrame } from '@/components/decorative-frame';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Wiadomość została wysłana pomyślnie! Odpowiemy w ciągu 24 godzin.',
        });
        // Reset formularza
        if (form) {
          form.reset();
        }
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Wystąpił błąd podczas wysyłania wiadomości.',
        });
      }
    } catch (error) {
      console.error('Błąd formularza:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Wystąpił błąd połączenia. Spróbuj ponownie później.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <HeroSection
            backgroundImage="/images/hero/kontakt-hero-background-with-dots.webp"
            title="Skontaktuj się z nami"
            description="Masz pytania o naszą stronę? Chcesz współpracować? Napisz na e-mail lub skorzystaj z formularza kontaktowego poniżej."
          />
        </div>
      </div>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Contact Content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <DecorativeFrame borderSize={8} insidePadding={16} glowingBorder glowColor="#d64c29" glowRadius={100}>
              <CardHeader className='p-0'>
                <CardTitle>O nas</CardTitle>
                <CardDescription>Poznaj naszą misję i wartości</CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <Typography variant="p" className="text-sm text-muted-foreground leading-relaxed">
                  DociekAI to miejsce poświęcone rozwojowi kompetencji przyszłości. Tworzymy treści,
                  które pomagają dzieciom i młodzieży rozwijać umiejętności niezbędne w XXI wieku,
                  takie jak myślenie krytyczne, kreatywność, współpraca i komunikacja.
                </Typography>
              </CardContent>
            </DecorativeFrame>

            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              {/* plik z public/ — custom loader i tak go nie transformuje (src/lib/media/loader.ts) */}
              <Image
                src="/images/general-photos/innovation-learn.webp"
                alt="Innowacyjne uczenie się i rozwój kompetencji przyszłości"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                unoptimized
              />
            </div>
            <DecorativeFrame borderSize={8} insidePadding={16} glowingBorder glowColor="#d64c29" glowRadius={100} dotsBackground='sparkles' sparkleCount={360}>
              <CardHeader className='p-0'>
                <CardTitle className="flex items-center gap-2 p-0">
                  <Mail className="h-5 w-5 text-primary" />
                  Informacje kontaktowe
                </CardTitle>
                <CardDescription>
                  Skontaktuj się z nami za pomocą poniższych kanałów
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-0">


                <div className="flex">
                  <Typography variant="h4" className="text-sm font-medium">
                    Email: <span className="font-normal">hello@dociekai.pl</span>
                  </Typography>
                </div>

              </CardContent>
            </DecorativeFrame>
          </div>

          {/* Contact Form */}
          <DecorativeFrame borderSize={8} insidePadding={16} glowingBorder glowColor="#d64c29" glowRadius={100} dotsBackground='dots'>
            <CardHeader className='p-0 pb-8'>
              <CardTitle>Formularz kontaktowy</CardTitle>
              <CardDescription>Wyślij nam wiadomość, a odpowiemy w ciągu 24 godzin</CardDescription>
            </CardHeader>
            <CardContent className='pb-4'>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Status wiadomości */}
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-md ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Imię *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Twoje imię"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nazwisko *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Twoje nazwisko"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="twoj.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+48 123 456 789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Temat *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Czego dotyczy Twoja wiadomość?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Opisz szczegółowo swoją sprawę..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </Button>
              </form>
            </CardContent>
          </DecorativeFrame>
        </div>
      </div>
    </div>
    </>
  );
}
