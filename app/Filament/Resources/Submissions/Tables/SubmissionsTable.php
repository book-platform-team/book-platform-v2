<?php

namespace App\Filament\Resources\Submissions\Tables;

use App\Models\Author;
use App\Models\Book;
use App\Models\Scopes\ApprovedScope;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SubmissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('book_title')->label('عنوان الكتاب')->searchable(),
                TextColumn::make('author_name')->label('المؤلف')->searchable(),
                TextColumn::make('author_email')->label('البريد')->searchable(),
                BadgeColumn::make('status')
                    ->label('الحالة')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ]),
                TextColumn::make('created_at')->label('تاريخ الإرسال')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options(['pending' => 'قيد المراجعة', 'approved' => 'موافَق عليه', 'rejected' => 'مرفوض']),
            ])
            ->recordActions([
                EditAction::make()->label('عرض التفاصيل'),

             Action::make('approve')
    ->label('قبول')
    ->icon('heroicon-o-check')
    ->color('success')
    ->visible(fn ($record) => $record->status === 'pending')
    ->requiresConfirmation()
    ->action(function ($record) {
        $book = Book::withoutGlobalScope(ApprovedScope::class)->find($record->book_id);
        $book->update(['status' => 'approved', 'published_at' => now()]);
        $record->update(['status' => 'approved']);

        // إرسال كود تأكيد sale_email تلقائيا عند الموافقة
        if ($book->sale_email) {
            app(\App\Http\Controllers\SaleEmailController::class)
                ->sendVerificationCode($book);
        }

        Notification::make()->title('تم قبول الكتاب ونشره')->success()->send();
    }),

                Action::make('reject')
    ->label('رفض')
    ->icon('heroicon-o-x-mark')
    ->color('danger')
    ->visible(fn ($record) => $record->status === 'pending')
    ->requiresConfirmation()
    ->action(function ($record) {
        $book = Book::withoutGlobalScope(ApprovedScope::class)->find($record->book_id);
        $book->update(['status' => 'rejected']);
        $record->update(['status' => 'rejected']);

        Notification::make()->title('تم رفض الكتاب')->warning()->send();
    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}