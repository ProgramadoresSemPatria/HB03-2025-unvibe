import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const installationId = requestUrl.searchParams.get('installation_id')

  if (code) {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      if (error.message?.includes('installation_id') || error.message?.includes('null value')) {
        return NextResponse.redirect(
          new URL(
            '/?error=installation_id_required&message=' +
            encodeURIComponent('O installation_id é obrigatório. Por favor, faça login novamente com o installation_id na URL.'),
            requestUrl.origin
          )
        )
      }

      if (error.message?.includes('Database error') || error.message?.includes('saving new user')) {
        return NextResponse.redirect(
          new URL('/?error=database_error&message=' + encodeURIComponent(error.message), requestUrl.origin)
        )
      }
      return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
    }

    if (data.user && installationId) {
      try {
        const adminClient = createAdminClient()

        // Extract GitHub account info from user metadata
        const githubUsername = data.user.user_metadata?.user_name || data.user.user_metadata?.preferred_username
        const accountType = data.user.user_metadata?.account_type || 'User'

        // Insert or update the installation record in the database
        const { error: installationError } = await adminClient
          .from('installations')
          .upsert({
            installation_id: parseInt(installationId),
            account_login: githubUsername,
            account_type: accountType,
            owner_user_id: data.user.id,
          }, {
            onConflict: 'installation_id'
          })

        if (installationError) {
          console.error('Error saving installation:', installationError)
          return NextResponse.redirect(
            new URL(
              '/?error=installation_save_failed&message=' +
              encodeURIComponent('Failed to save installation. Please try again.'),
              requestUrl.origin
            )
          )
        }
      } catch (error) {
        console.error('Error in installation process:', error)
        return NextResponse.redirect(
          new URL(
            '/?error=installation_error&message=' +
            encodeURIComponent('An error occurred while setting up the installation.'),
            requestUrl.origin
          )
        )
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}

