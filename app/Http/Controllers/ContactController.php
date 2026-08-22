<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    private const EMAIL_REGEX = '/^[^\s&=?\/\\\\<>\'"]+@[^\s&=?\/\\\\<>\'"]+$/';

    public function store(Request $request)
    {
        $baseRules = [
            'type' => 'required|in:general,publish_request,order,other,copyright,print_request',
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'regex:'.self::EMAIL_REGEX],
            'phone' => 'nullable|string|max:50',
        ];

        if ($request->type === 'print_request') {
            $rules = array_merge($baseRules, [
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'book_title' => 'required|string|max:255',
                'pages' => 'required|integer|min:1',
                'size' => 'required|in:A4,A5,16x24',
                'copies' => 'required|array|min:1|max:3',
                'copies.*' => 'integer|min:1',
            ]);
        } elseif ($request->type === 'copyright') {
            $rules = array_merge($baseRules, [
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
            ]);
        } else {
            $rules = array_merge($baseRules, [
                'message' => 'required|string',
                'subject' => 'nullable|string|max:255',
            ]);
        }

        $data = $request->validate($rules);

        ContactMessage::create([
            'type' => $data['type'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'] ?? '',
            'message' => $data['message'],
            'book_title' => $data['book_title'] ?? null,
            'pages' => $data['pages'] ?? null,
            'size' => $data['size'] ?? null,
            'copies' => $data['copies'] ?? null,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'تم استلام رسالتك، سنتواصل معك قريباً',
        ], 201);
    }
}