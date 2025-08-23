import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JSensei</h1>
          <p className="text-gray-600">Tu tutor inteligente de JavaScript</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">¡Revisa tu correo!</CardTitle>
            <CardDescription>Te hemos enviado un enlace de confirmación a tu correo electrónico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                Para completar tu registro, haz clic en el enlace que te enviamos por correo. Si no lo encuentras,
                revisa tu carpeta de spam.
              </p>
            </div>

            <div className="text-center">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Volver al inicio de sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
