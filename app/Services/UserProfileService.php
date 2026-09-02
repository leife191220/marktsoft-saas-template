<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class UserProfileService
{
    public function updateProfile(User $user, array $validatedData, ?UploadedFile $avatarFile = null): void
    {
        // 1. Si el usuario subió una nueva foto
        if ($avatarFile) {
            // Si ya tenía una foto antes, la borramos del disco para ahorrar espacio
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Guardamos la nueva foto en la carpeta 'avatars'
            $path = $avatarFile->store('avatars', 'public');
            $validatedData['avatar'] = $path;
        }

        // 2. Actualizamos los datos
        $user->fill($validatedData);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
    }

    public function deleteAccount(User $user): void
    {
        // Si elimina su cuenta, también borramos su foto de perfil
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        Auth::logout();
        $user->delete();
    }
}
