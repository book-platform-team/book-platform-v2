<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ContactMessageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('type')->label('النوع')->disabled(),
                TextInput::make('name')->label('الاسم')->disabled(),
                TextInput::make('email')->label('البريد')->email()->disabled(),
                TextInput::make('phone')->label('الهاتف')->tel()->disabled(),
                TextInput::make('subject')->label('الموضوع')->disabled(),
                Textarea::make('message')->label('الرسالة')->columnSpanFull()->disabled(),
                TextInput::make('book_title')->label('عنوان الكتاب')->disabled(),
                TextInput::make('pages')->label('الصفحات')->disabled(),
                TextInput::make('size')->label('المقاس')->disabled(),
                TextInput::make('ip')->label('IP')->disabled(),
            ]);
    }
}